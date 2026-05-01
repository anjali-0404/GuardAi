import os
import json
import asyncio
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class GeminiService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key or api_key == "sk-placeholder-key-for-ui-testing":
            raise ValueError("Valid GEMINI_API_KEY not found in environment variables")
         
        genai.configure(api_key=api_key)
        # Using Gemini Pro model
        self.model = genai.GenerativeModel('gemini-pro')
    
    async def analyze_code(self, prompt: str):
        try:
            # Configure generation params for JSON output
            generation_config = {
                "temperature": 0.1,
                "top_p": 0.8,
                "top_k": 40,
                "max_output_tokens": 4096,
            }
            
            # Run the synchronous generate_content in a thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None, 
                lambda: self.model.generate_content(
                    prompt,
                    generation_config=generation_config
                )
            )
            
            content = response.text
            
            # Clean up any potential markdown fences
            if content.startswith("```json"):
                content = content.replace("```json", "", 1).rsplit("```", 1)[0].strip()
            elif content.startswith("```"):
                content = content.replace("```", "", 1).rsplit("```", 1)[0].strip()
            
            return json.loads(content)
        except Exception as e:
            print(f"Error calling Gemini API: {e}")
            raise e

# Initialize service (will raise error if no valid key)
try:
    gemini_service = GeminiService()
except ValueError as e:
    print(f"Warning: {e}")
    gemini_service = None
except Exception as e:
    print(f"Unexpected error initializing Gemini service: {e}")
    gemini_service = None