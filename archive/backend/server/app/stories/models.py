from pydantic import BaseModel
from uuid import UUID
from common.models import JobStatus, StoryNode
from datetime import datetime
from typing import Optional


class RandomStory(BaseModel):
    title: str
    description: str


class StoryCreateInput(BaseModel):
    title: str
    description: str


class StoryDeleteInput(BaseModel):
    id: UUID


class StoryResolveNodeInput(BaseModel):
    story_id: UUID
    choice: str


class StorySelectPublic(BaseModel):
    id: UUID
    title: str
    description: str
    status: JobStatus
    story_nodes: list[StoryNode]
    user_id: str
    updated_at: datetime
    banner_image_url: Optional[str]
    public: bool


class StoryCreatePublic(BaseModel):
    id: UUID
    status: JobStatus


class StoryPublic(StoryCreateInput):
    id: UUID
    status: JobStatus
    updated_at: datetime
    banner_image_url: Optional[str]
    public: bool
    user_id: str


class StoryResolveNodePublic(BaseModel):
    story_id: UUID
    node_id: UUID


class StoryNodePublic(BaseModel):
    id: UUID
    choice_text: str
    parent_node_id: Optional[UUID]
    image_url: Optional[str]
    setting: str
    consumed: bool
    children: list["StoryNodePublic"]
    public: bool
    user_id: str
