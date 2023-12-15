import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import logo from "../src/log.png"


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 1200,
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
      <div className="logo"> <img src={logo} alt="Logo" /></div>
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
  <ul>
    <li>
  <Typography id="modal-about-title" variant="h6" component="h2">
    Our Story
  </Typography>
 
   <p> PeerProver is born from a deep appreciation for the art of theorem proving and the challenges faced by mathematics students. We set out to create a tool that would make this journey smoother and more rewarding.</p>
</li>
<li>
    <Typography variant="h6"component="h2">What Is PeerProver?</Typography>
    <p>PeerProver is your trusted companion on the path to mastering theorem proving. Developed on the foundations of LEAN prover, LEAN DOJO, and Chat GPT, PeerProver provides an environment where mathematics students can hone their skills.</p>
    </li>
    <li>
    <Typography variant="h6" component="h2">What Sets Us Apart?</Typography>
   <p>1- Lean3 Interpreter: We've integrated a powerful LEAN3 Interpreter, so you can craft and validate theorems with ease.<br/>
      2- Guidance When You Need It: When you hit a roadblock, PeerProver offers tactical suggestions to help you move forward.<br/>
      3- Deeper Insights: Utilizing GPT 3.5, we offer detailed explanations for these tactics, ensuring you not only overcome obstacles but also gain a deeper understanding.</p>
    </li>
<li>
    <Typography variant="h6" component="h2">Experience the Future of Theorem Proving:</Typography>
    <p>Enhance your theorem proving experience with PeerProver. Join us on this exciting journey toward mathematical mastery.</p>
    </li>
  </ul>
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
  <Typography id="modal-about-title" variant="h6" component="h2">
    Inside PeerProver: A Guided Tour
  </Typography>
  <Typography id="modal-about-description" sx={{ mt: 2 }}>
    <p>PeerProver is divided into two parts to streamline your theorem proving experience.</p>
    <Typography variant="h6" component="h2">The LEAN3 Prover - Your Proving Ground:</Typography>
    <p>The first part consists of:</p>
    1. <strong>The Editor:</strong> Here, you'll find the space to write your code. This is where you craft the blueprint of your proof, providing the structure and logic to support your theorems.
    <br/>
    2. <strong>The Interpreter:</strong> The interpreter is your partner in the journey. It reveals the current state of your proof, helping you keep track of your progress and ensuring you're on the right path.

    <Typography variant="h6" component="h2">Exploring the Right Half: Predict and Explain:</Typography>

    <p>The right half of PeerProver is where you access vital assistance for your proofs.</p>

    <p>- <strong>Predict Tactic Button:</strong> With a simple click, you can generate a list of four possible LEAN3 tactics. These tactics can serve as your guiding lights when you find yourself stuck or seeking inspiration on how to advance your proof.</p>

  <p>  - <strong>Explain Button:</strong> Situated next to each tactic, the "Explain" button is your bridge to deeper understanding. It connects you to GPT-generated explanations, unraveling the intricacies of each tactic and its application in your proof.</p>

  <p>PeerProver's design empowers you to seamlessly transition from building your proof to receiving targeted assistance, ensuring your journey in theorem proving is both intuitive and enlightening.</p>
  </Typography>
</Box>

      </Modal>
    </nav>
  );
}

export default Navbar;
