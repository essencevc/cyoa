from pydantic import BaseModel
from enum import Enum
from datetime import datetime


class StoryStatus(Enum):
    SUBMITTED = "submitted"
    RUNNING = "running"
    FAILED = "failed"
    COMPLETED = "completed"


class StoryNode(BaseModel):
    node_id: int
    story_id: int
    parent_node_id: int | None
    image_url: str
    setting: str
    choices: list[str]
    consumed: bool
    created_at: datetime


class Story(BaseModel):
    id: int
    title: str
    description: str
    user_id: str
    content: list[StoryNode]
    status: StoryStatus


class StoryCreateInput(BaseModel):
    title: str
    description: str


class StoryDeleteInput(BaseModel):
    story_id: int


class RestateStoryInput(BaseModel):
    story_id: str
    title: str
    setting: str


class GeneratedStory(BaseModel):
    setting: str
    choices: list[str]


class GeneratedStoryContinuation(BaseModel):
    current_story_summary: str
    setting: str
    choices: list[str]
