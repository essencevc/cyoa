import restate
import shortuuid
import logging
from restate.context import Context
from restate.service import Service
from restate.exceptions import TerminalError

from .workflow import StoryInput, story_workflow, generate_story

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
        
        # Log the workflow_call response
        logger.info(f"Workflow call response: {response}")
        
        return response
    except Exception as e:
        logger.error(f"Error in generate handler: {e}", exc_info=True)
        raise TerminalError(f"{e}")


app = restate.app(services=[cyoa, story_workflow])
