from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Column, Enum, Relationship
import enum
import uuid


class JobStatus(str, enum.Enum):
    PROCESSING = "processing"
    FAILED = "failed"
    COMPLETED = "completed"


class Story(SQLModel, table=True):
    __tablename__ = "story"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str
    description: str
    user_id: str
    status: JobStatus = Column(Enum(JobStatus))
    updated_at: datetime = Field(default_factory=datetime.now)
    banner_image_url: Optional[str] = Field(default=None)
    error_message: Optional[str] = Field(default=None, max_length=1024)


class StoryNode(SQLModel, table=True):
    __tablename__ = "story_node"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    story_id: uuid.UUID = Field(foreign_key="story.id", ondelete="CASCADE")
    parent_node_id: Optional[uuid.UUID] = Field(
        default=None, foreign_key="story_node.id", ondelete="CASCADE"
    )
    choice_text: str
    image_url: str
    setting: str
    user_id: str
    consumed: bool = False

    parent: Optional["StoryNode"] = Relationship(
        back_populates="children",
        sa_relationship_kwargs=dict(
            remote_side="StoryNode.id",
        ),
    )
    children: list["StoryNode"] = Relationship(back_populates="parent")
