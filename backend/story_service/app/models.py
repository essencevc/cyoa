from pydantic import BaseModel


class RestateStoryInput(BaseModel):
    story_id: str
    title: str
    setting: str


class RestateStoryContinuationInput(BaseModel):
    story_id: str
    parent_node_id: str


class GeneratedStory(BaseModel):
    setting: str
    choices: list[str]


class GeneratedStoryContinuation(BaseModel):
    current_story_summary: str
    setting: str
    choices: list[str]
