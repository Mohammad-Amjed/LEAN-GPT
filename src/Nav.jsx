import React, { useState } from 'react';
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

function Navbar() {
  const [openAboutModal, setOpenAboutModal] = useState(false);
  const [openInstructionsModal, setOpenInstructionsModal] = useState(false);

  const handleOpenAbout = () => setOpenAboutModal(true);
  const handleCloseAbout = () => setOpenAboutModal(false);

  const handleOpenInstructions = () => setOpenInstructionsModal(true);
  const handleCloseInstructions = () => setOpenInstructionsModal(false);

  return (
    <nav>
      <div className="logo">Peer proover</div>
      <ul>
        <li><a href="#" onClick={handleOpenAbout}>About</a></li>
        <li><a href="#" onClick={handleOpenInstructions}>Instructions</a></li>
        {/* Add more navigation links here */}
      </ul>

      {/* About Modal */}
      <Modal
        open={openAboutModal}
        onClose={handleCloseAbout}
        aria-labelledby="modal-about-title"
        aria-describedby="modal-about-description"
      >
        <Box sx={style}>
          <Typography id="modal-about-title" variant="h6" component="h2">
            About Peer Proover
          </Typography>
          <Typography id="modal-about-description" sx={{ mt: 2 }}>
            Description of Peer Proover goes here.
          </Typography>
        </Box>
      </Modal>

      {/* Instructions Modal */}
      <Modal
        open={openInstructionsModal}
        onClose={handleCloseInstructions}
        aria-labelledby="modal-instructions-title"
        aria-describedby="modal-instructions-description"
      >
        <Box sx={style}>
          <Typography id="modal-instructions-title" variant="h6" component="h2">
            Instructions for Peer Proover
          </Typography>
          <Typography id="modal-instructions-description" sx={{ mt: 2 }}>
            Instructions for using Peer Proover go here.
          </Typography>
        </Box>
      </Modal>
    </nav>
  );
}

export default Navbar;
