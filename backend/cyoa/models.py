from pydantic import BaseModel, field_validator

class StoryInput(BaseModel):
    title: str
    content: str
    main_character: str


class StoryContinuationInput(BaseModel):
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
    story: list[StoryNode]
