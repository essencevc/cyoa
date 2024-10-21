import restate
from cyoa.workflow import story_workflow

app = restate.app(services=[story_workflow])
