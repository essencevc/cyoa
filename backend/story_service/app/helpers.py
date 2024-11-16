from common.models import StoryNode, JobStatus, Story
from story_service.app.models import (
    RestateStoryInput,
    GeneratedStoryContinuation,
    GeneratedStory,
    FinalStoryChoice,
    RewrittenChoice,
    FinalStory,
)
from typing import Optional
from uuid import UUID, uuid4
import asyncio
from story_service.app.settings import restate_settings
from sqlmodel import select
from common.db import DatabaseEngine
import instructor

database_engine = DatabaseEngine(restate_settings)


def get_db_session():
    return next(database_engine.get_session())


def log_story_error(story_id: UUID, error: Exception):
    with get_db_session() as session:
        print(f"Encountered error of {error}")
        story = session.exec(select(Story).where(Story.id == story_id)).first()
        story.status = JobStatus.FAILED
        story.error_message = str(error)
        session.add(story)
        session.commit()


async def generate_story(
    client: instructor.AsyncInstructor, story_input: RestateStoryInput
):
    resp = await client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": """
        
        Generate a story that has

        - Story Setting: {{ story_input.setting}}
        - Story Title: {{ story_input.title }}

        Flesh out a description of the setting and the plot summary that is vivid and has a lot of details
        
        Rules
        - Generate 2-4 choices that represent actions which the user can take and make sure it's not a terminal choice, the story is just beginning!
        - Generate a visual description that can be used to generate an image for the story
        - Art style should just describe the style of the image. This should mention the color palette, the style of the characters, and the style of the background.
        """,
            }
        ],
        model="gpt-4o-mini",
        response_model=GeneratedStory,
        context={"story_input": story_input},
    )
    return resp.model_dump()


async def rewrite_choice(
    client: instructor.AsyncInstructor,
    choice: str,
    story: GeneratedStory,
    prev_choices: list[str],
    sem: asyncio.Semaphore,
    max_depth: int,
) -> FinalStoryChoice:
    task = (
        "This is a terminal choice. End the story and rewrite the choice setting and consequence to reflect that. The story should be wrapped up here."
        if len(prev_choices) == max_depth - 1
        else "Continue the story and suggest 2-4 potential choices if applicable"
    )
    async with sem:
        for retry_attempt in range(3):
            try:
                async with asyncio.timeout(15):
                    rewritten_choice = await client.chat.completions.create(
                        model="gpt-4o-mini",
                        messages=[
                            {
                                "role": "user",
                                "content": """
                            You're an expert story writer. You're given the following choice from a story.

                            Choice: {{ choice }}

                            Rules
                            - Make sure that the choice is consistent with the overall plot of the story.
                            - {{task}}
                            - If the story is ending, make sure that the story consequence reflects a proper wrap up to the story.
                            - Choice descriptions should just be 1-2 sentences and reflect a specific user action that the user can take.
                            - New Potential choices should be unique and distinct. They should move the story forward in a meaningful way and be distinct from the provided choice above since they are choices to be made after the user has made the choice above.
                            - Feel free to terminate the story at this specific choice if it makes sense to do so. Just return an empty list for choices. 
                            
                            Story Description: 
                            - Setting : {{ story.setting }}
                            - Plot Summary : {{ story.plot_summary }}

                            Prior Choices Made:
                            {% for prev_choice in previous_choices %}
                            {{ loop.index }}. {{ prev_choice['choice_consequences'] }} : {{ prev_choice['choice_description'] }}
                            {% endfor %}
                            """,
                            }
                        ],
                        context={
                            "choice": choice,
                            "story": story,
                            "previous_choices": prev_choices,
                            "task": task,
                        },
                        response_model=RewrittenChoice,
                    )
            except asyncio.TimeoutError:
                # Recursively retry the same function call
                print(
                    f"TimeoutError for choice: {choice}, Retried {retry_attempt} times"
                )
                pass

    if len(prev_choices) == max_depth - 1:
        return FinalStoryChoice(
            choice_description=rewritten_choice.choice_description,
            choice_consequences=rewritten_choice.choice_consequences,
            choices=[],
        )

    coros = [
        rewrite_choice(
            client=client,
            choice=potential_choice,
            story=story,
            prev_choices=prev_choices
            + [
                {
                    "choice_description": rewritten_choice.choice_description,
                    "choice_consequences": rewritten_choice.choice_consequences,
                }
            ],
            max_depth=max_depth,
            sem=sem,
        )
        for potential_choice in rewritten_choice.choices
    ]

    rewritten_choices = await asyncio.gather(*coros)

    return FinalStoryChoice(
        choice_description=rewritten_choice.choice_description,
        choice_consequences=rewritten_choice.choice_consequences,
        choices=rewritten_choices,
    )


async def rewrite_story(
    client: instructor.AsyncInstructor,
    story: GeneratedStory,
    max_depth: int = 3,
    max_concurrent_requests: int = 10,
):
    sem = asyncio.Semaphore(max_concurrent_requests)
    coros = [
        rewrite_choice(
            client=client,
            choice=choice,
            story=story,
            prev_choices=[],
            max_depth=max_depth,
            sem=sem,
        )
        for choice in story.choices
    ]
    rewritten_choices = await asyncio.gather(*coros)
    result = FinalStory(
        story_setting=story.setting,
        plot_summary=story.plot_summary,
        choices=rewritten_choices,
    )

    return result.model_dump()


def flatten_and_format_nodes(
    story_id,
    user_id,
    nodes: list[FinalStoryChoice],
    parent_id: Optional[UUID],
    acc: list[StoryNode],
) -> list[StoryNode]:
    for node in nodes:
        node_id = uuid4()
        new_node = StoryNode(
            id=node_id,
            story_id=story_id,
            parent_node_id=parent_id,
            choice_text=node.choice_description,
            image_url="",
            setting=node.choice_description,
            user_id=user_id,
        )
        acc = acc + [new_node]
        if node.choices:
            acc = flatten_and_format_nodes(
                story_id, user_id, node.choices, node_id, acc
            )
    return acc


# ------- Old Stuff ------
async def generate_story_continuation(
    client, story_id: str, parent_node_id: str, user_choice: str, story_summary: str
):
    with get_db_session() as session:
        story_node = StoryNode(
            story_id=story_id,
            parent_node_id=parent_node_id,
            starting_choice=user_choice,
            status=JobStatus.PROCESSING,
            consumed=False,
            setting=story_summary,
            choices=[],
        )
        session.add(story_node)
        session.commit()
        session.refresh(story_node)
        node_id = story_node.id

    resp = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "user",
                "content": """
                You're a fantasy story writer. You're given a setting and a user choice.
                You need to generate a continuation of the story based on the user choice.

                Current Story Setting: {{story_summary}}

                When faced with this, the user chose: {{user_choice}}

                Generate a continuation of the story based off the setting and the user choice. 

                This should include
                - A new setting that describes what happened as a result of the user choice
                - A new story summary that describes the current state of the story and takkes into account the user choice
                - A list of choices that the user can choose from next. Each choice should be a 1-2 sentences at most of a action description.

                
                """,
            }
        ],
        response_model=GeneratedStoryContinuation,
        context={
            "story_summary": story_summary,
            "user_choice": user_choice,
        },
    )

    # await generate_image(resp.setting, story_id, node_id)

    with get_db_session() as session:
        story_node = session.exec(
            select(StoryNode).where(StoryNode.id == node_id)
        ).one()
        story_node.status = JobStatus.COMPLETED
        story_node.setting = resp.setting
        story_node.choices = resp.choices
        story_node.current_story_summary = resp.current_story_summary
        session.commit()
