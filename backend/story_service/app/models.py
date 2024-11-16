from pydantic import BaseModel, Field, field_validator, ValidationInfo
from uuid import UUID


class RestateStoryInput(BaseModel):
    story_id: UUID
    title: str
    setting: str
    user_id: str


class RestateStoryContinuationInput(BaseModel):
    story_id: UUID
    parent_node_id: UUID


class GeneratedStory(BaseModel):
    setting: str
    plot_summary: str
    art_style: str
    main_character_description: str
    choices: list[str]


class FinalStoryChoice(BaseModel):
    choice_description: str
    choice_consequences: str
    choices: list["FinalStoryChoice"]


class FinalStory(BaseModel):
    story_setting: str
    plot_summary: str
    choices: list[FinalStoryChoice]


class RewrittenChoice(BaseModel):
    choice_description: str
    choice_consequences: str
    choices: list[str]

    @field_validator("choices")
    def validate_choices(cls, v, info: ValidationInfo):
        original_choice = info.context["choice"]
        if original_choice in v:
            raise ValueError(
                "Choices must be unique - do not repeat the original choice"
            )
        return v


class GeneratedStoryContinuation(BaseModel):
    current_story_summary: str
    setting: str
    choices: list[str] = Field(min_items=1)
