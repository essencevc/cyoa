from pydantic import BaseModel, Field, field_validator, ValidationInfo
from uuid import UUID


class RestateStoryInput(BaseModel):
    story_id: UUID
    title: str
    setting: str
    user_id: str


class PromptInfo(BaseModel):
    node_id: str
    image_slug: str
    image_description: str


class InferenceInput(BaseModel):
    callback_url: str
    prompts: list[PromptInfo]


class GeneratedStory(BaseModel):
    setting: str
    plot_summary: str
    image_description: str
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


class GeneratedImageDescription(BaseModel):
    image_description: str
