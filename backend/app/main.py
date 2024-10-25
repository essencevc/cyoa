from fastapi import FastAPI
from app.stories.router import router as stories_router

app = FastAPI()
app.include_router(stories_router)


@app.get("/")
def read_root():
    return {"Hello": "World"}
