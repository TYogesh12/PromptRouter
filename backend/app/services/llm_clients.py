from groq import Groq
from google import genai
from backend.app.config import GROQ_API_KEY, GEMINI_API_KEY
from typing import List

groq_client = Groq(api_key=GROQ_API_KEY)
genai_client= genai.Client(api_key=GEMINI_API_KEY)

def call_groq(model_name:str, prompt:str, history: List=None) -> tuple[str, int, int]:
    messages = []
    if history:
        for p in history:
            messages.append({'role':'user', 'content':p.prompt})
            messages.append({'role':'assistant', 'content':p.response})
    messages.append({'role': 'user', 'content': prompt})

    response = groq_client.chat.completions.create(
        model = model_name,
        messages = messages
    )
    
    response_text = response.choices[0].message.content
    input_tokens = response.usage.prompt_tokens
    output_tokens = response.usage.completion_tokens

    return response_text, input_tokens, output_tokens

def call_gemini(model_name:str, prompt:str, history: List=None) -> tuple[str, int, int]:
    contents = []
    if history:
        for p in history:
            contents.append({'role': 'user', 'parts': [{'text': p.prompt}]})
            contents.append({'role': 'model', 'parts': [{'text': p.response}]})
    contents.append({'role': 'user', 'parts': [{'text': prompt}]})
    response = genai_client.models.generate_content(
        model = model_name,
        contents = contents
    )
    response_text = response.text
    input_tokens = response.usage_metadata.prompt_token_count
    output_tokens = response.usage_metadata.candidates_token_count
    return response_text, input_tokens, output_tokens