const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
const CDP = require('chrome-remote-interface');

const app = express();
const port = 3000; 

const openai = new OpenAIApi(
  new Configuration({ apiKey: '' })
);
const tactics = ["intro", "exact", "apply", "trivial", "exfalso", "change", "by_contra", "by_cases", "cases", "split", "refl", "rw", "left", "right", "assumption"];
app.use(express.json());
app.use(cors()); // Add this line to enable CORS

app.post('/update', async (req, res) => {
  const { update } = req.body;
  try {
    const response = await generateGPT35TurboResponse(tactics, update);
    res.json({ leanCode: response });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});
app.post('/question', async (req, res) =>  {
  const { question } = req.body;
  try {
    console.log(question);
    ;
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});
app.post('/open-url', async (req, res) => {
  const { leanCode } = req.body;
  const fullHttpUrl = convertLeanToHttp(leanCode + " \nend");
  console.log(fullHttpUrl); // Log the fullHttpUrl value

  res.json({ fullHttpUrl }); // Return the fullHttpUrl in the response
});


const generateGPT35TurboResponse = async (tactics, update) => {
  const topic = 'LEAN 3';
  console.log(update);
  const GPT35TurboMessage = [
    { role: 'system', content: `You are a ${topic} developer. response format: return ONLY the lean tactic `},
    { role: 'assistant', content: 'LEAN 3 tactics.' },
    { role: 'user', content:   "Question: which LEAN 3 tactic from the following list" + tactics + " is descriped by (split the goal into subgoals). Answer: split" +  "Question: which LEAN 3 tactic from the following list" + tactics + " is descriped by" + update + ". Answer: "  },

  ];



  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: GPT35TurboMessage,
    });

    const result = response.data.choices[0].message.content;
    return result;
  } catch (error) {
    throw error;
  }
};

const convertLeanToHttp = (leanCode) => {
  const encodedCode = encodeURIComponent(leanCode);
  const baseUrl = 'http://localhost:8080/#code=';
  const fullHttpUrl = baseUrl + encodedCode;
  return fullHttpUrl;
};

const controlChrome = async (leanCode) => {
  // try {
  //   const client = await CDP();

  //   await Promise.all([client.Page.enable(), client.Runtime.enable()]);

  //   await client.Runtime.evaluate({
  //     expression: `window.location.href = '${convertLeanToHttp(leanCode)}'; location.reload(true);`,
  //   });

  //   await client.close();
  // } catch (err) {
  //   throw err;
  // }
};

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
