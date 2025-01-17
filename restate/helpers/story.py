import instructor
import google.generativeai as genai
from pydantic import BaseModel, field_validator, ValidationInfo
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


class StoryNode(BaseModel):
    title: str
    story_description: str
    banner_image_description: str
    user_choices: list[str]

    @field_validator("user_choices")
    def validate_user_choices(cls, v, info: ValidationInfo):
        context = info.context
        if len(v) != 2 and context["remaining_turns"] > 0:
            raise ValueError("Only provide two choices to the user")

        if len(v) == 0 and context["remaining_turns"] != 0:
            raise ValueError(
                "You must provide two choices for the user to advance the story"
            )

        return v


class FinalStoryNode(BaseModel):
    id: str
    parent_id: str | None
    title: str
    description: str
    image_description: str
    choice_title: str
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
                Here is a prompt provided by a user who wants to play an adventure game.

                <prompt>
                {{ prompt }}
                </prompt>

                Read the prompt carefully, identify specific details and elements and then generate the following

                - A title for the story that's between 3-6 words
                - A description for the story that's between 3-5 sentences. In this description, you must introduce the main character and set the scene. Make sure to mention the main character's name and what's at stake for them here in this existing situation implicitly.
                - A short 1 sentence  description for a banner image . This should be a description of a pixel art image that's suitable for the story as cover art. Be specific about the colors, style of the image, individual components of the image and the background.
                """,
            },
            {"role": "user", "content": prompt},
        ],
    )


async def generate_choices(
    client: instructor.AsyncInstructor,
    title: str,
    description: str,
    user_choices: list[dict],
    max_depth: int,
    semaphore: Semaphore,
    parent_id: str | None,
    choice_title: str,
) -> list[FinalStoryNode]:
    async with semaphore:
        STATE = ""

        if len(user_choices) == 0:
            STATE = "INITIAL"
        elif len(user_choices) < max_depth:
            STATE = "INTERIM"
        else:
            STATE = "CONCLUSION"

        choices = await client.chat.completions.create(
            response_model=StoryNode,
            messages=[
                {
                    "role": "system",
                    "content": """
                    {% if state == "INITIAL" %}
Here's a story outline that we've generated previously based on a user prompt

<outline>
Title: {{ story_title }}
Description: {{ story_description }}
</outline>

Based on the outline above, generate the following:

- A description and title of a new chapter in the story that picks off where the description below ends. This should be a continuation of the story above and between 4-6 sentences.
- Two choices that the user can make at that point in time to advance the story. These titles should be between 3-6 words.
- A banner image description of about 15 words that's suitable for the story as cover art. This should be in a pixel art and retro 8-bit style. Mention specific details of the image in the description.
                    {% endif %}
                    
                    {% if state == "INTERIM" %}
Here's a story outline that we've generated previously based on a user prompt

<outline>
Title: {{ story_title }}
Description: {{ story_description }}
</outline>

Based on the outline above, generate the following:

- A description and title of a new chapter in the story that picks off where the description below ends. This should be a continuation of the story above and between 3-5 sentences.
- Two choices that the user can make at that point in time to advance the story. These titles should be between 3-6 words. Make sure to reference specific elements mentioned in the generated description of the story chapter.
- A banner image description of about 15 words that's suitable for the story as cover art. This should be in a pixel art and retro 8-bit style. Mention specific details of the image in the description.

{% if previous_choices | length >= 1 %}
Here are the previous choices made by the main character leading up to this point in the story. Read them carefully and make sure to reference specific elements mentioned in the generated description of the new story chapter.
{% endif %}

<previous choices>
    {% for choice in previous_choices %}
    <choice {{loop.index}}>
    Choice Context: {{ choice.context }}
    Options: {{ choice.options }}
    User Chose: {{ choice.user_choice }}
    </choice>
{% endfor %}
<previous choices>
                    {% endif %}

                    {% if state == "CONCLUSION" %}
Here's a story outline that we've generated previously based on a user prompt

<outline>
Title: {{ story_title }}
Description: {{ story_description }}
</outline>

Here are the previous choices made by the main character leading up to this point in the story. Read them carefully and make sure to reference specific elements mentioned in your generated description of the story ending.

<previous choices>
    {% for choice in previous_choices %}
    <choice {{loop.index}}>
    Choice Context: {{ choice.context }}
    Choice Options: {{ choice.options }}
    User Chose: {{ choice.user_choice }}
    </choice>
{% endfor %}
<previous choices>

Based on the outline above, generate the following:

- A description of the final chapter of the story that's between 3-5 sentences. This should be a conclusion of the story and tie up all loose ends.
- There should be no choices for the user to make at this point in the story.
- A banner image description of about 15 words that's suitable for the story as cover art. This should be in a pixel art and retro 8-bit style. Mention specific details of the image in the description.                
                    
                    {% endif %}
                    """,
                },
            ],
            context={
                "story_title": title,
                "story_description": description,
                "previous_choices": user_choices,
                "remaining_turns": max_depth - len(user_choices),
                "state": STATE,
            },
        )

        res = [
            FinalStoryNode(
                id=str(uuid.uuid4()),
                parent_id=parent_id,
                title=choices.title,
                description=choices.story_description,
                image_description=choices.banner_image_description,
                is_terminal=STATE == "CONCLUSION",
                choice_title=choice_title,
            )
        ]

        if STATE == "CONCLUSION":
            return res

        coros = [
            generate_choices(
                client,
                title,
                description,
                user_choices
                + [
                    {
                        "user_choice": choice,
                        "options": " or ".join(choices.user_choices),
                        "context": choices.story_description,
                    }
                ],
                max_depth,
                semaphore,
                parent_id=res[0].id,
                choice_title=choice,
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
        genai.GenerativeModel("gemini-2.0-flash-exp"), use_async=True
    )
    final_nodes = await generate_choices(
        client, story.title, story.description, [], 4, sem, None, "Our Story Begins"
    )

    print(f"Final Nodes: {len(final_nodes)}")

    return StoryNodes(nodes=final_nodes)


async def generate_images(
    choices: list[FinalStoryNode],
    story_id: str,
    banner_image_description: str,
):
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
            }
            for node in choices
        ]

        # Add banner request
        requests_data.append(
            {
                "story_id": story_id,
                "node_id": "banner",
                "prompt": banner_image_description,
            }
        )

        # Send all requests concurrently
        async with aiohttp.ClientSession() as session:
            tasks = [send_request(session, data) for data in requests_data]
            await asyncio.gather(*tasks)

        return "Success"

    except Exception as e:
        print(e)
        raise e


async def generate_tts(
    nodes: list[FinalStoryNode], story_id: str, story_description: str
):
    import asyncio
    import aiohttp

    async def send_request(session, request_data):
        try:
            async with session.post(
                Env().KOKORO_ENDPOINT, json=request_data, timeout=1.0
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
            "prompt": node.description,
            "node_id": node.id,
            "story_id": story_id,
        }
        for node in nodes
    ]

    # Add banner request
    requests_data.append(
        {
            "story_id": story_id,
            "node_id": "theme",
            "prompt": story_description,
        }
    )

    # Send all requests concurrently
    async with aiohttp.ClientSession() as session:
        tasks = [send_request(session, data) for data in requests_data]
        await asyncio.gather(*tasks)

    return "Success"
