from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, JSON, Relationship, Column, Enum
import enum
import uuid


class JobStatus(str, enum.Enum):
    PROCESSING = "processing"
    FAILED = "failed"
    COMPLETED = "completed"


class Story(SQLModel, table=True):
    __tablename__ = "story"
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str
    description: str
    user_id: str
    status: JobStatus = Column(Enum(JobStatus))
    updated_at: datetime = Field(default_factory=datetime.now)

    nodes: List["StoryNode"] = Relationship(
        back_populates="story", sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


class StoryNode(SQLModel, table=True):
    __tablename__ = "story_node"
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)
    story_id: uuid.UUID = Field(foreign_key="story.id", ondelete="CASCADE")
    parent_node_id: Optional[uuid.UUID] = Field(
        default=None, foreign_key="story_node.id", ondelete="CASCADE"
    )
    image_url: Optional[str] = None
    setting: str
    starting_choice: Optional[str] = None
    choices: List[str] = Field(default_factory=list, min_items=1, sa_type=JSON)
    current_story_summary: Optional[str] = None
    consumed: bool = Field(default=False)
    status: JobStatus = Column(Enum(JobStatus))
    story: Story = Relationship(back_populates="nodes")

    parent: Optional["StoryNode"] = Relationship(
        back_populates="children",
        sa_relationship_kwargs={
            "remote_side": "StoryNode.id",
            "cascade": "all, delete-orphan",
            "single_parent": True,
        },
    )
    children: List["StoryNode"] = Relationship(back_populates="parent")
