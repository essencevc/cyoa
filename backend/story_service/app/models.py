from pydantic import BaseModel, Field
from uuid import UUID


class RestateStoryInput(BaseModel):
    story_id: UUID
    title: str
    setting: str


class RestateStoryContinuationInput(BaseModel):
    story_id: UUID
    parent_node_id: UUID


class GeneratedStory(BaseModel):
    setting: str
    choices: list[str] = Field(min_items=1)


class GeneratedStoryContinuation(BaseModel):
    current_story_summary: str
    setting: str
    choices: list[str] = Field(min_items=1)
