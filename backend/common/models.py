from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, JSON, Relationship, Column, Enum
import enum


class JobStatus(str, enum.Enum):
    PROCESSING = "processing"
    FAILED = "failed"
    COMPLETED = "completed"


class Story(SQLModel, table=True):
    __tablename__ = "story"
    id: Optional[int] = Field(default=None, primary_key=True)
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
    id: int = Field(primary_key=True)
    story_id: int = Field(foreign_key="story.id", ondelete="CASCADE")
    parent_node_id: Optional[int] = Field(
        default=None, foreign_key="story_node.id", ondelete="CASCADE"
    )
    image_url: Optional[str] = None
    setting: str
    starting_choice: Optional[str] = None
    choices: Optional[dict] = Field(default=None, sa_type=JSON)
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
