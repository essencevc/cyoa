from restate import Service, Context
import restate

cyoa = Service("cyoa")

@cyoa.handler()
async def generate(ctx: Context, story: str) -> str:
    return f"Hello {story}!"

app = restate.app(services=[cyoa])
