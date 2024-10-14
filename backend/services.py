from restate.context import Context
from restate.service import Service
import restate
from .workflow import generate_main_story, StoryInput
import shortuuid

cyoa = Service("cyoa")

@cyoa.handler()
async def generate(ctx: Context, user_id: str,title: str, main_character: str, content: str) -> str:
    story_id = str(user_id + "-" + str(shortuuid.uuid()))
    story_input = StoryInput(title=title, main_character=main_character, content=content)
    ctx.workflow_send(generate_main_story, key=story_id, arg=story_input)
    return story_id

app = restate.app(services=[cyoa])
