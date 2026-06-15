import pickle
from backend.app.config import ML_MODEL, ML_VECTORIZER

class PromptClassifier:
    def __init__(self):
        self.model = pickle.load(open(ML_MODEL,"rb"))
        self.vectorizer =pickle.load(open(ML_VECTORIZER,"rb"))
    
    def classify(self,prompt:str):
        vector_prompt = self.vectorizer.transform([prompt])
        prediction = self.model.predict(vector_prompt)[0]
        return prediction

classifier = PromptClassifier()

