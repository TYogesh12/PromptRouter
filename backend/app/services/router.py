from backend.app.services.llm_clients import call_groq, call_gemini
from backend.app.services.classifier import classifier
from typing import List

mapper = {
    'simple' : "llama-3.1-8b-instant",
    "moderate" : "llama-3.3-70b-versatile",
    "hard" : "gemini-2.5-flash"
}


def route_prompt(prompt:str, history: List=None) -> tuple[str,str,str,int,int]:
    complexity = classifier.classify(prompt)
    model = mapper.get(complexity)
    context = history[-5:] if history else None
    if model in ["llama-3.1-8b-instant","llama-3.3-70b-versatile"]:
        response, in_tok, out_tok = call_groq(model,prompt, context)
    elif model == "gemini-2.5-flash":
        response, in_tok, out_tok = call_gemini(model,prompt, context)
    else:
        raise ValueError(f"Unknown complexity level: {complexity}")
    return response, complexity, model, in_tok, out_tok