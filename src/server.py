from flask import Flask, request, jsonify
from flask_cors import CORS

from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

# Replace "MODEL_NAME" with the actual name of the pretrained tactic generator model.
tactic_generator_model_name = "kaiyuy/leandojo-lean3-tacgen-byt5-small"

# Load the tokenizer and model
tokenizer = AutoTokenizer.from_pretrained(tactic_generator_model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(tactic_generator_model_name)

app = Flask(__name__)
CORS(app)

@app.route('/generate_tactics', methods=['POST'])
def generate_tactics():
    # Get the input proof state from the request
    state = request.json['proof_state']
    tokenized_state = tokenizer(state, return_tensors="pt")

    # Generate multiple tactics via beam search.
    tactic_candidates_ids = model.generate(
        tokenized_state.input_ids,
        max_length=1024,
        num_beams=4,
        length_penalty=0.0,
        do_sample=False,
        num_return_sequences=4,
        early_stopping=False,
    )
    tactic_candidates = tokenizer.batch_decode(
        tactic_candidates_ids, skip_special_tokens=True
    )
    
    return jsonify({"tactics": tactic_candidates})

if __name__ == '__main__':
    app.run(debug=True)
