from __future__ import annotations
from restate.workflow import WorkflowContext, WorkflowSharedContext, Workflow
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

async def generate_story(story: StoryInput) -> StoryNode:
    pass

@story_workflow.handler()
async  def generate_story(ctx: WorkflowSharedContext)

@story_workflow.main()
async def generate_story(ctx: WorkflowContext, story: StoryInput) -> StoryNode:
    ctx.set("story_input", story.dump_json())
    await ctx.run(
        "generate_story",
        lambda: generate_story(story)
    )

    return story
