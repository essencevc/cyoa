from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.stories.router import router as stories_router
from common.settings import env
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.include_router(stories_router)


# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


@app.get("/health")
def health():
    return {"status": "ok"}
