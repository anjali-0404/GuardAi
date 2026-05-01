import os
import json
from anthropic import AsyncAnthropic
from dotenv import load_dotenv

load_dotenv()

class ClaudeService:
    def __init__(self):
        self.client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        # Using the exact version requested by the user
        self.requested_model = "claude-sonnet-4-20250514"

    async def analyze_code(self, prompt: str):
        try:
            response = await self.client.messages.create(
                model=self.requested_model,
                max_tokens=4096,
                system="You are CodeGuard-AI, an elite security engineer.",
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            # The prompt asks for strict JSON.
            content = response.content[0].text
            # Remove any potential markdown fences if Claude ignored instructions
            if content.startswith("```json"):
                content = content.replace("```json", "", 1).rsplit("```", 1)[0].strip()
            elif content.startswith("```"):
                content = content.replace("```", "", 1).rsplit("```", 1)[0].strip()
            
            return json.loads(content)
        except Exception as e:
            print(f"Error calling Claude API: {e}")
            raise e

claude_service = ClaudeService()
