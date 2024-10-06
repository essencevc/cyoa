from __future__ import annotations
from restate.workflow import WorkflowContext, Workflow
from pydantic import BaseModel
from typing import List, Optional

story_workflow = Workflow("StoryWorkflow")

class StoryInput(BaseModel):
    title: str
    content: str
    main_character: str

class StoryNode(BaseModel):
    choice_text: Optional[str]
    content: str
    image_id: Optional[str]
    music_id: Optional[str]
    choices: List[StoryNode]

@story_workflow.main()
async def generate_story(ctx: WorkflowContext, story: StoryInput) -> StoryNode:
    story = await ctx.run()
    return story
