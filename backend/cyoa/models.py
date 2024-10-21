from pydantic import BaseModel, field_validator
from enum import Enum

class StoryStatus(Enum):
    SUBMITTED = "submitted"
    RUNNING = "running"
    FAILED = "failed"
    COMPLETED = "completed"

class StoryInput(BaseModel):
    story_id: str
    user_id: str
    title: str
    content: str
    main_character: str

class StoryContinuationInput(BaseModel):
    user_id: str
    story_id: str
    previous_setting: str
    previous_choice: str
    main_character: str


class Choice(BaseModel):
    choice_text: str
    is_terminal: bool

class StoryNode(BaseModel):
    setting: str
    choices: list[Choice]

    @field_validator("choices")
    def validate_choices(cls, v):
        if len(v) < 3:
            raise ValueError("At least three choices are required")
        return v

class StoryOutput(BaseModel):
    story_id: str
    user_id: str
    story: list[StoryNode]
