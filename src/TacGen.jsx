import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateTacticPrediction } from './redux/actions'; // Import your action creator
import allActions from "./redux/actions";
import { CircularProgress } from '@mui/material';
import axios from 'axios';
import Gptcom from './gptcom.jsx';

const TacGen = () => {
  const [showTactic, setShowTactic] = useState(false);
  const [Tactic, setTactic] = useState(undefined)
  const [Explanation, setExplanation] = useState("GPT explanation will appear here")
  const dispatch = useDispatch();
  const text = useSelector((state) => state.text.value);

  const handleClick = () => {
    setShowTactic(true);
    dispatch(allActions.textAction.clearText());
    dispatch(allActions.updateTacticPrediction(true));
    console.log(text)
  };

const handleExplain = async (t) => {
  try {
    setExplanation("Loading...")
    setTactic(t)
    const response = await axios.post('http://localhost:3000/api/question', { tactic: t, goal: text[0][1] });
    setExplanation(() =>  response.data.explanation );
    
  } catch (error) {
    console.error('Error:', error);
  }
}

useEffect(()=> {console.log(text)},[text])
  return (
    <>
    <div className='tacGen'>
        <div>
        <h1>Generate a Tactic</h1>
      {showTactic && (
        <div>
  
          {text.length === 0 ? (
            <div className='loading-spinner'>
              <CircularProgress />
              <p className='loading-text'>Predicting Tactics...</p>
            </div>
          ) : (
          <div>
              <h3>the goal at line: {text[0][2]} is: {text[0][1]}</h3>
            <ol className='tacGen_tactics'>
              {text[0][0].map((t) => (
                <li className='tacGen_tactics_tactic' key={t}>
                  <span classNane="tacGen_tactics_tactic_span">{t}</span>
                  <button className="tacGen_tactics_tactic_button explain" onClick={()=>handleExplain(t)}> Explain</button>
                </li>
              ))}
            </ol>
            </div>
          )}
        </div>
      )}
      </div>
      <div className='tacGen_submit'>
       <button className='tacGen_submit__gen' onClick={handleClick}>Predict Tactics</button>
       {Tactic && <button className='tacGen_submit__regen' onClick={()=>handleExplain(Tactic)}>Regenerate</button>}
       </div>
    </div>
    <Gptcom explanation={Explanation} />
    </>
  );
};

export default TacGen;
