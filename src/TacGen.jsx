import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import allActions from "./redux/actions";
import { CircularProgress } from '@mui/material';
import axios from 'axios';
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

const TacGen = ({ tactics = [], ...props }) => {
  const [showTactic, setShowTactic] = useState(false);
  const [explanation, setExplanation] = useState("Explanation is loading...");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const[predictedTactics, setPredictedTactics] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const text = useSelector((state) => state.text.value);

  const handleOpenModal = (tactic) => {
    setPredictedTactics([]);
    handleExplain(tactic);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleClick = () => {
    props.predict();
    setIsLoading(true); 
    setShowTactic(true);
    // dispatch(allActions.textAction.clearText());
    // dispatch(allActions.updateTacticPrediction(true));
  };

  const handleExplain = async (tactic) => {
    try {
      setExplanation("Loading explanation...");
      const response = await axios.post('http://localhost:3000/api/question', {
        tactic: tactic,
        goal: text[0][1]
      });
      setExplanation(response.data.explanation);
    } catch (error) {
      console.error('Error:', error);
      setExplanation("Failed to load explanation.");
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => console.log('Text copied to clipboard:', text))
      .catch(err => console.error('Unable to copy text to clipboard:', err));
  };

  useEffect(() => {
    if(tactics.length > 0 ){
      setShowTactic(true);
      setIsLoading(false);
      setPredictedTactics(tactics);
    }
  }, [tactics]);
  

  return (
    <>
      <div className='tacGen'>
        <div>
          <h1>Predict Tactics</h1>
          {showTactic && (
            <div>
              {isLoading  ? (
                <div className='loading-spinner'>
                  <CircularProgress />
                  <p className='loading-text'>Predicting Tactics...</p>
                </div>
              ) : (
                <div>
                  <h3>Tactic Prediction based on the state at line: {predictedTactics[2]} </h3>
                  <ol className='tacGen_tactics'>
                    {predictedTactics.map((tactic, index) => (
                      <li className='tacGen_tactics_tactic' key={index}>
                        <span className="tacGen_tactics_tactic_span">{tactic}</span>
                        <div>
                          <Button className="tacGen_tactics_tactic_button explain" onClick={() => handleCopyToClipboard(tactic)}>Copy</Button>
                          <Button className="tacGen_tactics_tactic_button explain" onClick={() => handleOpenModal(tactic)}>Explain</Button>
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
          <Button className='tacGen_submit__gen' onClick={handleClick}>Predict Tactics</Button>
        </div>
      </div>

      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="modal-explain-title"
        aria-describedby="modal-explain-description"
      >
        <Box sx={style}>
          <Typography id="modal-explain-title" variant="h6" component="h2">
            GPT Explanation
          </Typography>
          <Typography id="modal-explain-description" sx={{ mt: 2 }}>
            {explanation}
          </Typography>
        </Box>
      </Modal>
    </>
  );
};

export default TacGen;
