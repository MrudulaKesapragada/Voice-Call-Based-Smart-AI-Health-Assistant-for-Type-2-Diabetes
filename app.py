from flask import Flask, request, jsonify
from flask_cors import CORS # 1. Import CORS
import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from deep_translator import GoogleTranslator

# Import your existing modules
from stt_engine import listen_and_transcribe
from tts_engine import speak

app = Flask(__name__)
CORS(app) # 2. Enable CORS

# Load Dataset & AI Model
df = pd.read_csv("diabetes_qa_combined.csv", encoding="latin1")

questions = df["question"].astype(str).tolist()
answers = df["answer"].astype(str).tolist()
embedder = SentenceTransformer("all-MiniLM-L6-v2")
question_embeddings = embedder.encode(questions, normalize_embeddings=True)

def get_best_answer(query_en):
    query_embedding = embedder.encode([query_en], normalize_embeddings=True)
    similarities = cosine_similarity(query_embedding, question_embeddings)[0]
    best_index = similarities.argmax()
    if similarities[best_index] < 0.60:
        return "I am not fully sure about this. Please maintain a healthy diet and consult a doctor."
    return answers[best_index]

@app.route('/process_voice', methods=['POST'])
def process_voice():
    # Get language from React frontend
    data = request.json
    lang = data.get('lang', 'en')
    
    # Step 1: Listen (STT)
    user_text, _ = listen_and_transcribe(lang)
    
    if not user_text:
        return jsonify({"error": "Voice not clear"}), 400

    # Step 2: Logic Flow
    if lang == "te":
        search_text = GoogleTranslator(source="te", target="en").translate(user_text)
        ans_en = get_best_answer(search_text)
        final_ans = GoogleTranslator(source="en", target="te").translate(ans_en)
    else:
        final_ans = get_best_answer(user_text)

    # Step 3: Speak (TTS) - Plays on the system
    speak(final_ans, lang)

    # Return data to React to update the Chat UI
    return jsonify({
        "user_text": user_text,
        "assistant_response": final_ans
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)