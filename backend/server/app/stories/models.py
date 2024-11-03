from pydantic import BaseModel
from uuid import UUID
from common.models import JobStatus
from datetime import datetime


class StoryCreateInput(BaseModel):
    title: str
    description: str


class StoryCreatePublic(StoryCreateInput):
    id: UUID
    status: JobStatus


class StoryPublic(StoryCreateInput):
    id: UUID
    status: JobStatus
    updated_at: datetime
