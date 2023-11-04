// src/loggerService.js
function logInteraction(type, message) {
    const logEntry = `${type}: ${message}`;
    fetch('http://localhost:3000/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ logEntry }),
    });
  }
  
  export { logInteraction };
  