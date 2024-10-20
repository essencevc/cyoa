import json
from typing import List, Optional
from libsql_client import create_client
from cyoa.models import StoryOutput

class DB:
    def __init__(self, url: str, auth_token: Optional[str] = None):
        self.url = url
        self.auth_token = auth_token

    def _get_client(self):
        return create_client(url=self.url, auth_token=self.auth_token)
    
    async def save_story(self, story: StoryOutput):
        async with self._get_client() as client:
            await client.execute("""
                INSERT OR REPLACE INTO stories (id, user_id, content, updated_at)
                VALUES (?, ?, ?, date('now'))
            """, [story.id, story.user_id, story.title, json.dumps(story.content)])

    async def get_story(self, story_id: str) -> Optional[StoryOutput]:
        async with self._get_client() as client:
            result = await client.execute("SELECT content FROM stories WHERE id = ?", [story_id])
            if result.rows:
                row = result.rows[0]
                return StoryOutput.model_validate_json(json.loads(row[0]))
                
        return None

    async def get_stories_for_user(self, user_id: str) -> List[StoryOutput]:
        async with self._get_client() as client:
            result = await client.execute("SELECT content FROM stories WHERE user_id = ?", [user_id])  
            return [
                StoryOutput.model_validate_json(json.loads(row[0]))                    
                for row in result.rows
            ]

    async def delete_story(self, story_id: str):
        async with self._get_client() as client:
            await client.execute("DELETE FROM stories WHERE id = ?", [story_id])
