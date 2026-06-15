
model_cost= {
    "llama-3.1-8b-instant":{
        "input":0.05,
        "output":0.08
    },
    "llama-3.3-70b-versatile" : {
        "input":0.59,
        "output":0.79
    },
    "gemini-2.5-flash" : {
        "input":0.30,
        "output":2.50
    },
    "gpt-4o": {
        "input": 5.00,
        "output": 15.00
    }
}

Base_model = "gpt-4o"

def calculate_cost(model:str,input_tokens:int,output_tokens:int) -> float:
    model_used = model_cost.get(model)
    cost = (input_tokens * model_used["input"] + output_tokens * model_used["output"]) / 1000000
    return cost

def savings(actual_cost:float, input_tokens:int, output_tokens:int) -> float:
    baseline_cost = calculate_cost(Base_model,input_tokens,output_tokens)
    savings = baseline_cost - actual_cost
    return max(0, savings)