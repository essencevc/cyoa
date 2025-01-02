import instructor
import google.generativeai as genai
from pydantic import BaseModel, Field, model_validator
from helpers.env import Env
from asyncio import Semaphore, gather
import requests
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
    image_description: str
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
    image_description: str
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
                - Story choices should be unique and interesting and move the story in very distinct directions. The description for each choice should be short, concise and a single sentence.
                - Choices should not bring the user back to the a previous scenario that he has encountered
                - The story should end in {{ steps_remaining }} more choices at most. This means that the main character should either die, win, or reach the end of the story by then. There should be no more choices provided to the user ( and the user should not be able to make any more choices)

                Here are some examples of what the image description should look like. 
                {% endif %}

                Image descriptions should be detailed and include:
                - Key elements and items in the scene
                - Character actions and interactions
                - Mood and atmosphere
                
                Example:
                "Dimly lit cave with purple crystal walls, metallic spacecraft glowing cyan, awestruck miner with pickaxe, mining tracks, scattered tools, and floating dust particles"

                
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

                    Remember to output valid sentences, use proper grammar and punctuation. Make sure to output valid strings.
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
                image_description=choices.image_description,
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
        client, story.title, story.description, [], 3, sem, None
    )
    end = time.time()
    print(f"Time taken: {end - start}, Nodes : {len(final_nodes)}")

    return StoryNodes(nodes=final_nodes)


async def generate_images(
    choices: list[FinalStoryNode],
    story_id: str,
    image_promise_name: str,
    banner_image_description: str,
):
    callback_url = (
        f"{Env().RESTATE_ENDPOINT}/restate/awakeables/{image_promise_name}/resolve"
    )
    try:
        import asyncio
        import aiohttp

        async def send_request(session, request_data):
            try:
                async with session.post(
                    Env().IMAGE_ENDPOINT, json=request_data, timeout=1.0
                ) as response:
                    return await response.text()
            except asyncio.TimeoutError:
                return None
            except Exception as e:
                print(f"Failed to send request: {e}")
                return None

        # Prepare requests for each node and banner
        requests_data = [
            {
                "prompt": node.image_description,
                "node_id": node.id,
                "story_id": story_id,
                "callback_url": callback_url,
                "callback_token": Env().RESTATE_TOKEN,
            }
            for node in choices
        ]

        # Add banner request
        requests_data.append(
            {
                "story_id": story_id,
                "node_id": "banner",
                "prompt": banner_image_description,
                "callback_url": callback_url,
                "callback_token": Env().RESTATE_TOKEN,
            }
        )

        # Send all requests concurrently
        async with aiohttp.ClientSession() as session:
            tasks = [send_request(session, data) for data in requests_data]
            await asyncio.gather(*tasks)

        return callback_url

    except Exception as e:
        print(e)
        raise e


def generate_music(prompt: str, story_id: str, promise_name: str):
    callback_url = f"{Env().RESTATE_ENDPOINT}/restate/awakeables/{promise_name}/resolve"
    try:
        audio_request = {
            "prompt": prompt,
            "storyId": story_id,
            "callback_url": callback_url,
            "callback_token": Env().RESTATE_TOKEN,
        }

        requests.post(Env().AUDIO_ENDPOINT, json=audio_request, timeout=3.0)
        print(f"Successfully sent audio generation request for story {story_id}")
        return callback_url

    except requests.exceptions.Timeout:
        print(f"Audio generation request sent but timed out for story {story_id}")
        return True
    except Exception as e:
        print(f"Failed to send audio generation request: {e}")
        raise e
