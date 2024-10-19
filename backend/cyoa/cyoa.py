import restate
import shortuuid
from restate.context import Context
from restate.service import Service
from restate.serde import Serde
from restate.exceptions import TerminalError

from .workflow import StoryInput, story_workflow, generate_story

cyoa = Service("cyoa")


@cyoa.handler()
async def generate(ctx: Context, content: dict) -> dict:
    try:
        story_input = StoryInput.model_validate(content)
        response = await ctx.workflow_call(
            generate_story,
            key=shortuuid.uuid(),
            arg=story_input.model_dump(),
        )
        print(response)
        return response
    except Exception as e:
        raise TerminalError(f"{e}")


app = restate.app(services=[cyoa, story_workflow])
