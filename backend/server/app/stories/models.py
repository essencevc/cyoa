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


class StoryCreatePublic(BaseModel):
    id: UUID
    status: JobStatus


class StoryPublic(StoryCreateInput):
    id: UUID
    status: JobStatus
    updated_at: datetime


class StoryResolveNodePublic(BaseModel):
    story_id: UUID
    node_id: UUID


class StoryNodePublic(BaseModel):
    id: UUID
    parent_node_id: Optional[
        UUID
    ]  # Note this is optional since for the first node, it has no parent.
    image_url: Optional[str]
    setting: str
    starting_choice: str
    choices: list[str]
    consumed: bool
    story_id: UUID
    status: JobStatus
