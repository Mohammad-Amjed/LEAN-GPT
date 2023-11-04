import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateTacticPrediction } from './redux/actions'; // Import your action creator
import allActions from "./redux/actions";
import { CircularProgress } from '@mui/material';
import axios from 'axios';
import Gptcom from './gptcom.jsx';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const TacGen = () => {
  const [showTactic, setShowTactic] = useState(false);
  const [Tactic, setTactic] = useState(undefined);
  const [Explanation, setExplanation] = useState("Explanation is Loading ...");
  const [isModal, setModal] = useState(false);
  const [Clip, setClip] = useState("");

  const handleOpenModal = (t) => {
    handleExplain(t);
    setModal(true)};
  const handleCloseModal = () => setModal(false);
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

const handleCopyToClipboard = (t) => {
  // Create a textarea element to hold the text
  const textArea = document.createElement('textarea');
  textArea.value = t;
  document.body.appendChild(textArea);

  // Select the text within the textarea
  textArea.select();

  try {
    // Attempt to copy the selected text to the clipboard
    document.execCommand('copy');
    console.log('Text copied to clipboard:', t);
  } catch (err) {
    console.error('Unable to copy text to clipboard:', err);
  }

  // Remove the textarea from the DOM
  document.body.removeChild(textArea);
};

useEffect(()=> {console.log(text)},[text])
  return (
    <>
    <div className='tacGen'>
        <div>
        <h1>Predict Tactics</h1>
      {showTactic && (
        <div>
  
          {text.length === 0 ? (
            <div className='loading-spinner'>
              <CircularProgress />
              <p className='loading-text'>Predicting Tactics...</p>
            </div>
          ) : (
          <div>
              <h3>Tactic Prediction based on the state at line: {text[0][2]} </h3>
            <ol className='tacGen_tactics'>
              {text[0][0].map((t) => (
                <li className='tacGen_tactics_tactic' key={t}>
                  <span classNane="tacGen_tactics_tactic_span">{t}</span>
                  <div>
                  <button id="copy" className="tacGen_tactics_tactic_button explain" onClick={()=>handleCopyToClipboard(t)}> Copy</button>
                  <button className="tacGen_tactics_tactic_button explain" onClick={()=>handleOpenModal(t)}> Explain</button>
                </div>
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
       {/* {Tactic && <button className='tacGen_submit__regen' onClick={()=>handleExplain(Tactic)}>Regenerate</button>} */}
       </div>
    </div>
    {/* <Gptcom explanation={Explanation} /> */}

          {/* Explain Modal */}
          <Modal
        open={isModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-Explain-title"
        aria-describedby="modal-Explain-description"
      >
        <Box sx={style}>
          <Typography id="modal-Explain-title" variant="h6" component="h2">
            GPT Explanation
          </Typography>
          <Typography id="modal-Explain-description" sx={{ mt: 2 }}>
            {Explanation ? Explanation : "Explanation is Loading ..." }
          </Typography>
        </Box>
      </Modal>
    </>
  );
};

export default TacGen;
