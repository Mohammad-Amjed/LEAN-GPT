import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateTacticPrediction } from './redux/actions'; // Import your action creator

const TacGen = () => {
  const [showTactic, setShowTactic] = useState(false);
  const dispatch = useDispatch();
  const text = useSelector((state) => state.text.value);

  const handleClick = () => {
    setShowTactic(true);
    dispatch(updateTacticPrediction(true)); // Dispatch the action to update Redux state
  };

  return (
    <div className='tacGen'>
      <h2>Generate a Tactic</h2>
      <button onClick={handleClick}>Click to Generate a Tactic</button>
      {showTactic && (
        <div>
          {text.length === 0 ? (
            <p>Predicting tactic...</p>
          ) : (
            <div className='tacGen_tactics'>
              {text[0].map((t) => (
                <p className='tacGen_tactics_tactic' key={t}>
                  {t}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TacGen;
