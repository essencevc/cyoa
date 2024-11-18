from common.models import StoryNode, JobStatus, Story
import requests
from story_service.app.models import (
    RestateStoryInput,
    GeneratedStory,
    FinalStoryChoice,
    RewrittenChoice,
    FinalStory,
    GeneratedImageDescription,
    PromptInfo,
    InferenceInput,
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
        - Give a short description of an image for this story. This should be 1 sentence at most
        """,
            }
        ],
        model="gpt-4o-mini",
        response_model=GeneratedStory,
        context={"story_input": story_input},
    )
    return resp


async def call_modal_endpoint(image_prompts: list[PromptInfo], callback_url: str):
    try:
        async with asyncio.timeout(3):
            requests.post(
                "https://ivanleomk--flux-model-batch-model-inference.modal.run",
                json=InferenceInput(
                    prompts=image_prompts, callback_url=callback_url
                ).model_dump(),
                timeout=3,
            )
            return None
    except Exception as e:
        print(f"Error calling modal endpoint: {e}")
        return None


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
        else f"Continue the story and suggest 2-4 potential choices if applicable. The story should end in around {max_depth-len(prev_choices)-1} turns so take note of that"
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
                            - The choice description should be 1-2 sentences at most and describe a specific action (Eg. Do X , Go to Y ). It should not mention the name of the main character

                            - Choice Consequences will be shown to the user after they make the choice. It should be descriptive and well formatted.

                            - When generating choices, they have to be distinct and move the story forward. This means that they should not be a repeat of the choice above but instead reflect a new choice that the user can make because of a previous choice.
                            - {{task}}
                            - Feel free to terminate the story at this specific choice if it makes sense to do so. Just return an empty list for choices. 
                            - Give a short description of an image for this choice. This should be 1 sentence at most
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
    max_depth: int,
    max_concurrent_requests: int,
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

    return result


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
            setting=node.choice_consequences,
            user_id=user_id,
        )
        acc = acc + [new_node]
        if node.choices:
            acc = flatten_and_format_nodes(
                story_id, user_id, node.choices, node_id, acc
            )
    return acc


async def generate_image_description(
    client: instructor.AsyncInstructor,
    node: StoryNode,
    story: GeneratedStory,
    sem: asyncio.Semaphore,
):
    async with sem:
        image_description = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": """
                You're an AI which excels at generating short succint prompts that generate high quality images.

                Generate a prompt for this image in a single sentence. This should only make reference to what is within the image itself.

                Original Story Image Description : {{ story.image_description }}

                Choice that user made : {{ node.choice_text}}
                Current Story setting : {{ story.setting }}

                Rules
                - Adhere to the following style: whimsical, illustrative style reminiscent of a storybook, utilizing soft, flowing lines and light pastel colors if possible
                - The prompt should be a single sentence
                - Closely study the current setting, choice text and the story's original image description. 
                - generated prompt should only describe what is within the image itself and not make reference to character names, elements outside the image etc
                

                Good Image Descriptions
                - A whimsical image of a magic forest with a river platying through it. The trees are glowing and there are mushrooms and flowers everywhere.
                - A photo realistic image of a bustling farmer's market during golden hour. The scene is filled with vendors arranging colorful produce, customers interacting, and warm sunlight filtering through a canvas awning, casting long shadows on the ground.
                """,
                }
            ],
            context={
                "node": node,
                "story": story,
            },
            response_model=GeneratedImageDescription,
        )

    return PromptInfo(
        node_id=str(node.id),
        image_slug=f"{node.story_id}/{node.id}.jpg",
        image_description=image_description.image_description,
    )


async def generate_image_prompts(
    client: instructor.AsyncInstructor,
    story: GeneratedStory,
    nodes: list[StoryNode],
    max_concurrent_requests: int,
) -> dict[str, PromptInfo]:
    sem = asyncio.Semaphore(max_concurrent_requests)
    coros = [generate_image_description(client, node, story, sem) for node in nodes]
    image_prompts = await asyncio.gather(*coros)
    return {node.node_id: node.model_dump() for node in image_prompts}
