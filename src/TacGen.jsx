import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateTacticPrediction } from './redux/actions'; // Import your action creator
import allActions from "./redux/actions";
import { CircularProgress } from '@mui/material';

const TacGen = () => {
  const [showTactic, setShowTactic] = useState(false);
  const dispatch = useDispatch();
  const text = useSelector((state) => state.text.value);

  const handleClick = () => {
    setShowTactic(true);
    dispatch(allActions.textAction.clearText());
    dispatch(allActions.updateTacticPrediction(true));
    console.log(text)
  };
const handleExplain = (t) => {
  // GPT function
}

useEffect(()=> {console.log(text)},[text])
  return (
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
                  <button className="tacGen_tactics_tactic_button" onClick={()=>handleExplain(t)}> Explain</button>
                </li>
              ))}
            </ol>
            </div>
          )}
        </div>
      )}
      </div>
       <button className='tacGen_submit' onClick={handleClick}>Click to Generate a Tactic</button>
    </div>
  );
};

export default TacGen;
