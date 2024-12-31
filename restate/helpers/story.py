import instructor
import google.generativeai as genai
from pydantic import BaseModel, Field, model_validator
from helpers.env import Env
from asyncio import Semaphore, gather, timeout
import uuid

genai.configure(api_key=Env().GOOGLE_API_KEY)


class StoryOutline(BaseModel):
    title: str
    description: str
    melody: str
    banner_image: str


class Choice(BaseModel):
    title: str
    description: str


class StoryNode(BaseModel):
    is_terminal: bool = Field(description="Whether this is the end of the story")
    title: str = Field(description="A short title that describes the situation")
    description: str
    image: str
    user_choices: list[Choice]

    @model_validator(mode="after")
    def validate_user_choices(self) -> "StoryNode":
        if self.is_terminal:
            self.user_choices = []
            return self

        if len(self.user_choices) < 2 or len(self.user_choices) > 3:
            raise ValueError(
                f"Generate between 2 to 3 distinct choices for the user to choose from. Currently we have {len(self.user_choices)} choices."
            )
        return self


class FinalStoryNode(BaseModel):
    id: str
    parent_id: str | None
    title: str
    description: str
    image: str
    is_terminal: bool


class StoryNodes(BaseModel):
    nodes: list[FinalStoryNode]


def generate_story(prompt: str) -> str:
    client = instructor.from_gemini(genai.GenerativeModel("gemini-2.0-flash-exp"))
    return client.chat.completions.create(
        response_model=StoryOutline,
        messages=[
            {
                "role": "system",
                "content": """
                You're going to be given a prompt by a user. Based off the prompt generate the following

                1. A title for a story based off the prompt
                2. A 2-3 sentence description for an initial starting point where we can start the story
                3. A 2-3 sentence description of a melody/beat that would be suitable to be played while the story is being told - this can be anything as long as it matches the story
                4. A long and descriptive description of a banner image in pixel art style that would be suitable for the story as cover art

                Remember that we are just generating a starting point for the story. We'll be generating more situations as the user progresses through the story so don't worry about the story being complete.

                Here are some examples of what the banner image description should look like
                <banner examples>
                    Retro Pixel, A pixelated image of a german shepherd dog. The dogs fur is a vibrant shade of brown, with a black stripe running down its back. The background is a light green, and the dogs shadow is cast on the ground.

                    Retro Pixel, A pixelated image of a man surfing on a surfboard. The mans body is covered in a red shirt and blue shorts. His arms are out to the sides of his body. The surfboard is a vibrant blue color. The water is a light blue color with white splashes. The sun is shining on the right side of the image.

                    Retro Pixel, pixel art of a Hamburger in the style of an old video game, hero, pixelated 8bit, final boss 
                </banner examples>
                """,
            },
            {"role": "user", "content": prompt},
        ],
    )


async def generate_choices(
    client: instructor.AsyncInstructor,
    title: str,
    description: str,
    user_choices: list[Choice],
    max_depth: int,
    semaphore: Semaphore,
    parent_id: str | None,
) -> list[FinalStoryNode]:
    async with semaphore:
        choices = await client.chat.completions.create(
            response_model=StoryNode,
            messages=[
                {
                    "role": "system",
                    "content": """
                    You're going to be given a story description and choices that a user has made up to this point. 
                
                {% if steps_remaining == 0 %}
                You must end the story in this choice. The story should reach a satisfying conclusion with no further choices available.

                Your job is to generate the following
                - A title to conclude the story thus far
                - A 1-2 sentence description for what happens now that the story is complete
                - An image which depics the final conclusion of the story
                - An empty list for user_choices since the story is complete

                Rules
                - The story must end in this situation with a satisfying conclusion. Make sure that the user either dies, wins or reaches the end of the story by then. There cannot be any more choices available to the user.

                Here are some examples of what the image description should look like. Remember that it should showcase the final scene now that the story is complete.
                {% else %}
                Continue the story with interesting choices that progress toward a conclusion.

                Your job is to generate the following
                
                1. A title for the situation thus far
                2. A 1-2 sentence description for what happens between the previous situations and when the user is faced with the choices
                3. 2-3 choices that the user can make
                4. An image which depicts the current situation the user is facing

                Rules:
                - If you determine that the story is complete, return an empty list for the user_choices and return is_terminal as True
                - Story choices should be unique and interesting and move the story in very distinct directions
                - Write complete sentences and use proper grammar and punctuation. Make sure to output valid strings.
                - Choices descriptions should be 1-2 sentences and describe the significance of the choice
                - Choices should not bring the user back to the a previous situation
                - The story should end in {{ steps_remaining }} more choices at most. This means that the main character should either die, win, or reach the end of the story by then. There should be no more choices provided to the user ( and the user should not be able to make any more choices)

                Here are some examples of what the image description should look like. Remember that it should showcase what the current situation is like and what the user is facing from the last choice he has made when he is about to make the choice
                {% endif %}
                
                <banner examples>
                    Retro Pixel, A pixelated image of a german shepherd dog. The dogs fur is a vibrant shade of brown, with a black stripe running down its back. The background is a light green, and the dogs shadow is cast on the ground.

                    Retro Pixel, A pixelated image of a man surfing on a surfboard. The mans body is covered in a red shirt and blue shorts. His arms are out to the sides of his body. The surfboard is a vibrant blue color. The water is a light blue color with white splashes. The sun is shining on the right side of the image.

                    Retro Pixel, pixel art of a Hamburger in the style of an old video game, hero, pixelated 8bit, final boss 
                </banner examples>
                    """,
                },
                {
                    "role": "user",
                    "content": """
                    Here is the initial story description that we started with

                    Story title: {{ story_title }}
                    Story description: {{ story_description }}

                    Here are the choices that the user has made:
                    {% for choice in previous_choices %}
                    - {{ choice.title }} : {{ choice.description }}
                    {% endfor %}

                    {% if steps_remaining == 0 %}
                    Take into account the choices that the user has made so far and generate a final situation that concludes the story.
                    {% else %}
                    
                    Take into account the choices that the user has made so far and generate a new situation that progresses the story.
                    {% endif %}
                    """,
                },
            ],
            context={
                "story_title": title,
                "story_description": description,
                "previous_choices": user_choices,
                "steps_remaining": max_depth - len(user_choices),
            },
        )

        res = [
            FinalStoryNode(
                id=str(uuid.uuid4()),
                parent_id=parent_id,
                title=choices.title,
                description=choices.description,
                image=choices.image,
                is_terminal=choices.is_terminal,
            )
        ]
        if choices.is_terminal or max_depth - len(user_choices) == 0:
            return res

        coros = [
            generate_choices(
                client,
                title,
                description,
                user_choices
                + [
                    Choice(
                        title=choice.title,
                        description=f"{choices.description}. User chose to {choice.description}",
                    )
                ],
                max_depth,
                semaphore,
                parent_id=res[0].id,
            )
            for choice in choices.user_choices
        ]

        children = await gather(*coros)
        for child in children:
            res.extend(child)
        return res


async def generate_story_choices(story: StoryOutline):
    sem = Semaphore(50)
    client = instructor.from_gemini(
        genai.GenerativeModel("gemini-1.5-flash-latest"), use_async=True
    )
    import time

    start = time.time()
    final_nodes = await generate_choices(
        client, story.title, story.description, [], 2, sem, None
    )
    end = time.time()
    print(f"Time taken: {end - start}, Nodes : {len(final_nodes)}")
    print(
        "Initial Choices are ",
        len([node for node in final_nodes if node.parent_id is None]),
    )

    return StoryNodes(nodes=final_nodes)
