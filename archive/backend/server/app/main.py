from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from server.app.stories.router import router as stories_router
from server.app.user.router import router as user_router
app = FastAPI()

app.include_router(stories_router)
app.include_router(user_router)

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
