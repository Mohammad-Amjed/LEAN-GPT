from flask import Flask, Blueprint, jsonify, request
from flask_cors import CORS
import os
import openai
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

app = Flask(__name__)
CORS(app)

# Set up OpenAI API key
openai.api_key = os.environ["OPENAI_API_KEY"]

# Replace "MODEL_NAME" with the actual name of the pretrained tactic generator model.
tactic_generator_model_name = "kaiyuy/leandojo-lean3-tacgen-byt5-small"

# Load the tokenizer and model
tokenizer = AutoTokenizer.from_pretrained(tactic_generator_model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(tactic_generator_model_name)

# Create a Blueprint for your API routes
api_bp = Blueprint("api", __name__, url_prefix="/api")

@api_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({"message": "Server is up and running"})

@api_bp.route('/generate_tactics', methods=['POST'])
def generate_tactics():
    try:
        data = request.get_json()
        state = data['proof_state']
        tokenized_state = tokenizer(state, return_tensors="pt")
        
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
    except Exception as e:
        print('Error:', str(e))
        return jsonify({'error': 'An error occurred'}), 500

@api_bp.route('/question', methods=['POST'])
def question():
    try:
        data = request.get_json()
        goal = data['goal']
        tactic = data['tactic']
        
        topic = 'LEAN 3'
        GPT35TurboMessage = [
            {'role': 'system', 'content': f'You are a {topic} developer. INPUT: you will receive a LEAN3 goal of the proof and a possible tactic. OUTPUT: you will explain if the provided tactic is helpful for the first goal; if yes, say how; if no, say why.'},
            {'role': 'assistant', 'content': ''},
            {'role': 'user', 'content': f'prompt: is this LEAN 3 tactic {tactic} useful in the context of the first goal from: {goal}'},
        ]
        
        response = openai.ChatCompletion.create(
            model='gpt-3.5-turbo',
            messages=GPT35TurboMessage,
        )
        
        result = response.choices[0].message.content
        print(result)
        return jsonify({'explanation': result})
    except Exception as e:
        print('Error:', str(e))
        return jsonify({'error': 'An error occurred'}), 500

log_directory = 'logs'
if not os.path.exists(log_directory):
    os.makedirs(log_directory)

@app.route('/log', methods=['POST'])
def log_interaction():
    log_entry = request.json.get('logEntry')

    # Write the log data to a file
    with open(os.path.join(log_directory, 'interactions.log'), 'a') as log_file:
        if log_entry == "Enter":
            log_file.write('\n')
        else:
            log_file.write(log_entry)


    return 'Logged', 200
# Register the blueprint
app.register_blueprint(api_bp)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)  # Specify the port here
