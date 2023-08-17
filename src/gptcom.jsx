import React, { useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import axios from 'axios';

const Gptcom = (props) => {
  const [leanCode, setLeanCode] = useState(() => {
    // Check if there's a saved value in local storage, otherwise return the initial value
    return localStorage.getItem('leanCode') || `default`;
  });

  const [update, setUpdate] = useState('');
  const [Toggle, setToggle] = useState(false);
  const [ToggleQuestion, setToggleQuestion] = useState(() => {
        // Check if there's a saved value in local storage, otherwise return the default value
        const storedValue = localStorage.getItem('ToggleQuestion');
        return storedValue ? JSON.parse(storedValue) : false;
  });
  const [NLproof, setNLproof] = useState(() => {
    // Check if there's a saved value in local storage, otherwise return the initial value
    return localStorage.getItem('NLproof') || ``;
  });

  const [question, setQuestion] = useState(() => {
    // Check if there's a saved value in local storage, otherwise return the initial value
    return localStorage.getItem('question') || ``;
  });
  const text = useSelector((state) => state.text.value);
  const isPredicting = useSelector((state) => state.bool.value)

  useEffect(() => {
    // Save the leanCode state to local storage whenever it changes
    localStorage.setItem('leanCode', leanCode);
    handleOpenURL(leanCode);
  }, [leanCode]);
  useEffect(() => {
    // Save the leanCode state to local storage whenever it changes
    localStorage.setItem('NLproof', NLproof);
  }, [NLproof]);
  useEffect(() => {
    // Save the leanCode state to local storage whenever it changes
    localStorage.setItem('question', question);
  }, [question]);
  useEffect(() => {
    localStorage.setItem('ToggleQuestion', ToggleQuestion);
  }, [ToggleQuestion]);
  const handleUpdateAndOpenURL = async () => {
    try {
      const response = await axios.post('http://localhost:3000/update', {
        update: update,
      });

      setLeanCode((prevLeanCode) => prevLeanCode + `\n` + response.data.leanCode);
      setNLproof((prevNLproof) => prevNLproof + `\n` + update);

      // Call handleOpenURL whenever leanCode gets updated

    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleClick = () => {
    const info = '#code=0csdewwer';
    props.onGptcomInfo(info);
  };
  // a function that waits for the lean code to be updated and then opens the URL
  const handleQuestion = async () => {

    setToggleQuestion(true);
    try {
      const response = await axios.post('http://localhost:3000/question', { question: question });
      setLeanCode(() => `example :` + response.data.proquestion + `:=` + `\n` + `begin`);
      
    } catch (error) {
      console.error('Error:', error);
    }

    

  }

  const handleOpenURL = async (leanCode) => {
    try {
      setToggle(true);
      const response = await axios.post('http://localhost:3000/open-url', { leanCode });
      console.log('URL opened successfully');
      const fullHttpUrl = response.data.fullHttpUrl;

      // Update the URL with the new fullHttpUrl
      window.location.replace(fullHttpUrl);
      // history.replaceState(undefined, undefined, paramsToString(fullHttpUrl));
      if (Toggle) {
        window.location.reload(); // Reload the page only if Toggle is true
      }
      setToggle(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleReset = () => {
    const initialLeanCode = ``;
    const initialNLproof = ``;
    const initialQuestion = ``;
    const initialToggleQuestion = false;

    // Update leanCode
    setLeanCode(initialLeanCode);
    setNLproof(initialNLproof);
    setQuestion(initialQuestion)
    setToggleQuestion(initialToggleQuestion);

    // Save the updated initialLeanCode to local storage
    localStorage.setItem('leanCode', initialLeanCode);
  };

  // Helper function to split NLproof into separate lines
  const getNLproofLines = () => {
    return (
      <ol className="app_textarea_list">
        {NLproof.split('.').map((line, index) => (
          <li key={index} className="app_textarea_line">
            {line.trim()}
          </li>
        ))}
      </ol>
    );
  };

  return (
    <div className="app">
          <h1>GPT Explanation</h1>
          <p>{props.explanation ? props.explanation : "GPT explanation will appear here" }</p>
    </div>
  );
};

export default Gptcom;



{/* <div className="app_textarea">
<h2 className="app_textarea_title">Natural language Proof:</h2>
  <h3 className="app_textarea_title">Theorem: {question}</h3>

</div> */}

// {ToggleQuestion ?  <div className="app_inputdiv">
//   <div className="app_inputdiv_input">
//   <input
//     className="app_inputdiv_input_input" placeholder="Enter the step"
//     onChange={(e) => setUpdate(e.target.value)}
//   />
//   <button className="app_inputdiv_input_button" onClick={handleUpdateAndOpenURL}>
//     Translate
//   </button>
//   </div>
//   <button id="reset" onClick={handleClick}>Reset</button>
// </div> : <div className="app_inputdiv">
//   <div className="app_inputdiv_input">
//   <input
//     className="app_inputdiv_input_input" placeholder="Enter the Question"
//     onChange={(e) => setQuestion(e.target.value)}
//   />
//   <button className="app_inputdiv_input_button" onClick={handleQuestion}>
//     question
//   </button>
//   </div>
//   <button id="reset" onClick={handleClick}>Reset</button>
// </div>}