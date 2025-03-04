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


class UserChoice(BaseModel):
    choice_title: str
    choice_description: str


class StoryNode(BaseModel):
    title: str
    story_description: str
    banner_image_description: str
    user_choices: list[UserChoice]

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

    # This is the description of the story that we will show to the user after they have chosen this choice
    description: str

    # This is the description of the banner image that we will use to generate the image
    image_description: str

    # These are the choice title and description that we will show to the user
    choice_title: str
    choice_description: str

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

                <bad example>
                Pixel art of Kai walking through a dense forest, looking weary, with a village in the distance.
                </bad example>

                <good example>
                A lone martial artist stands silhouetted against a fiery sunset, pixel art style, orange and red hues dominate the sky.

                A brave knight faces a towering dragon, 8-bit pixel art, vibrant blues and greens with dark castle silhouette in background.

                A mysterious wizard casting spells in a moonlit forest clearing, pixel art style with purple and blue color palette, glowing magical particles.

                A space explorer on an alien planet with two suns, retro pixel art, teal and pink landscape with strange crystalline formations.

                A pirate ship sailing through a storm, 8-bit pixel art, deep blues and whites with lightning flashes illuminating the choppy waves.
                </good example>

                A good description will be specific, include details about how the image should look like in terms of just pure visual elements. Examples of these are the style, the colors, individual components of the image and the background.

                Make sure to provide specific details about the image, the colours, the style and the individual components of the image. We want something that has a strong 8 bit pixel art style.
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
) -> list[FinalStoryNode]:
    async with semaphore:
        is_terminal = max_depth - len(user_choices) == 0

        choices: StoryNode = await client.chat.completions.create(
            response_model=StoryNode,
            messages=[
                {
                    "role": "system",
                    "content": """
Continue the story where we last left off. You'll be given the outline of the story, previous choices made by the user and the remaining turns.

<story>
<title>
{{ story_title }}
</title>
<description>
{{ story_description }}
</description>

</story>

These are the previous choices made by the user:
<previous choices>
{% for choice in previous_choices %}
<choice {{loop.index}}>
Choice Context: {{ choice.story_context }}
Options: {% for option in choice.choices %}
    <option {{loop.index}}>
    Title: {{ option.title }}
    Description: {{ option.description }}
    </option>
{% endfor %}
User Chose: {{ choice.choice.choice_title }}
</choice>
{% endfor %}
</previous choices>

{% if remaining_turns == 0 %}
Based on the outline above, generate the following:

- A conclusion of the story that's between 3-5 sentences. Make sure to tie up all loose ends where possible and provide a satisfying conclusion to the story. This should not be too far off in the future from the previous choices made by the user. 
- There should be no choices for the user to make at this point in the story.
- A image description of about 15 words that's suitable for the story as cover art. This should be in a pixel art and retro 8-bit style. Mention specific details of the image in the description.

{% else %}
Based on the outline above, generate the following:
- A 3-4 sentence description of what happens next in the story based off previous user choices. If there are no previous user choices, make sure that you set the scene for the first choice explicitly and introduce the main character.
- Two distinct choices for the user to make that will meaningfully impact how the story continues. Each choice title must be distinct from each other.
- The choice title should be a single sentence that describes the user's choice. The description of the choice here should be around 2 sentences.
- A description for an image that's suitable for this story at this point. Make sure to mention specific details of the image in the description.
{% endif %}

<bad image description>
Pixel art of Kai walking through a dense forest, looking weary, with a village in the distance.
</bad image description>

<good image description>
A lone martial artist stands silhouetted against a fiery sunset, pixel art style, orange and red hues dominate the sky.

A brave knight faces a towering dragon, 8-bit pixel art, vibrant blues and greens with dark castle silhouette in background.

A mysterious wizard casting spells in a moonlit forest clearing, pixel art style with purple and blue color palette, glowing magical particles.

A space explorer on an alien planet with two suns, retro pixel art, teal and pink landscape with strange crystalline formations.

A pirate ship sailing through a storm, 8-bit pixel art, deep blues and whites with lightning flashes illuminating the choppy waves.
</good image description>

A good description will be specific, include details about how the image should look like in terms of just pure visual elements. Examples of these are the style, the colors, individual components of the image and the background.

Make sure to provide specific details about the image, the colours, the style and the individual components of the image. We want something that has a strong 8 bit pixel art style.
                    """,
                },
            ],
            context={
                "story_title": title,
                "story_description": description,
                "previous_choices": user_choices,
                "remaining_turns": max_depth - len(user_choices),
            },
        )

        res = [
            FinalStoryNode(
                id=str(uuid.uuid4()),
                parent_id=parent_id,
                title=choices.title,
                description=choices.story_description,
                image_description=choices.banner_image_description,
                is_terminal=is_terminal,
                choice_title="Start"
                if len(user_choices) == 0
                else user_choices[-1]["choice"].choice_title,
                choice_description="Start the story"
                if len(user_choices) == 0
                else user_choices[-1]["choice"].choice_description,
            )
        ]

        if is_terminal:
            return res

        coros = [
            generate_choices(
                client,
                title,
                description,
                user_choices
                + [
                    {
                        "choice": choice,
                        "options": [
                            {
                                "title": choice.choice_title,
                                "description": choice.choice_description,
                            }
                            for choice in choices.user_choices
                        ],
                        "context": choices.story_description,
                    }
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
        genai.GenerativeModel("gemini-2.0-flash-exp"), use_async=True
    )
    final_nodes = await generate_choices(
        client, story.title, story.description, [], 3, sem, None
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
