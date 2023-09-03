const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { Configuration, OpenAIApi } = require('openai');
const app = express();
const port = 3000; 

const openai = new OpenAIApi(
  new Configuration({ apiKey: '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' })
);

app.use(express.json());
app.use(cors()); // Add this line to enable CORS

app.post('/question', async (req, res) =>  {
  const { goal, tactic } = req.body;
  try {
    const response = await generateQuestion(goal,tactic);
    res.json({ explanation: response });
    ;
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

const generateQuestion = async (goal, tactic) => {
  const topic = 'LEAN 3';
  const GPT35TurboMessage = [
    { role: 'system', content: `You are a ${topic} developer. INPUT: you will receive a LEAN3 goal  of the proof and a possible tactic. OUTPUT: you will explain if the provided tactic is helpful for the first goal if yes say how if no say why. `},
    { role: 'assistant', content: '' },
    { role: 'user', content:   "prompt: is this LEAN 3 tactic " + tactic+ "usefull in the context of the forst goal from:" + goal   },

  ];



  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: GPT35TurboMessage,
    });

    const result = response.data.choices[0].message.content;
    console.log(result);
    return result;
  } catch (error) {
    if (error.response && error.response.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      console.log(`Rate limited. Retry after ${retryAfter} seconds.`);
      // Implement your retry logic here using setTimeout or similar.
    } else {
      throw error;
    }
  }
};

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
