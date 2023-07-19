// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const Gptcom = () => {
//   const [leanCode, setLeanCode] = useState(() => {
//     return localStorage.getItem('leanCode') || `theorem prop_example (p q r : Prop) : ((p \\/ q) -> r) <-> ((p -> r) \\/ (q -> r)) :=
//     begin
//     `;
//   });
//   const [question, setQuestion] = useState('');
//   const [update, setUpdate] = useState('');
//   const [NLproof, setNLproof] = useState(() => {
//     return localStorage.getItem('NLproof');
//   });

//   // State to control when to call handleOpenURL
//   const [shouldCallOpenURL, setShouldCallOpenURL] = useState(false);

//   // State to control when to reload the page
//   const [shouldReloadPage, setShouldReloadPage] = useState(false);

//   useEffect(() => {
//     // Save the leanCode state to local storage whenever it changes
//     localStorage.setItem('leanCode', leanCode);
//     localStorage.setItem('NLproof', NLproof);

//     // Set shouldCallOpenURL to true whenever leanCode gets updated
//     setShouldCallOpenURL(true);
//   }, [leanCode]);

//   useEffect(() => {
//     if (shouldCallOpenURL) {
//       handleOpenURL(leanCode);
//       setShouldCallOpenURL(false); // Reset the flag after the call
//     }
//   }, [shouldCallOpenURL, leanCode]);

//   const handleUpdateAndOpenURL = async () => {
//     try {
//       const response = await axios.post('http://localhost:3000/update', {
//         update: update,
//       });

//       setLeanCode((prevLeanCode) => prevLeanCode + `\n` + response.data.leanCode);
//       setNLproof((prevNLproof) => prevNLproof + `\n` + update);
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   };

//   const handleOpenURL = async (code) => {
//     try {
//       const response = await axios.post('http://localhost:3000/open-url', { leanCode: code });
//       console.log('URL opened successfully');
//       const fullHttpUrl = response.data.fullHttpUrl;

//       // Update the URL with the new fullHttpUrl
//       window.location.replace(fullHttpUrl);

//       // Check if the page should be reloaded
//       if (shouldReloadPage) {
//         window.location.reload();
//       }
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   };

//   const handleReset = () => {
//     const initialLeanCode = `theorem prop_example (p q r : Prop) : ((p \\/ q) -> r) <-> ((p -> r) \\/ (q -> r)) :=
//       begin
//     `;
//     const initialNLproof = `p or q implies r if and only if p implies r or  q implies r`;

//     // Update leanCode and set shouldReloadPage to true
//     setLeanCode(initialLeanCode);
//     setShouldReloadPage(true);

//     // Save the updated initialLeanCode to local storage
//     localStorage.setItem('leanCode', initialLeanCode);
//     handleOpenURL(initialLeanCode); // Call handleOpenURL with the new code
//   };

//   return (
//     <div className="app">
//       {/* Input for question (if needed) */}
//       {/* ... (rest of your JSX) ... */}

//       <div className="app_textarea">
//         <h3 className="app_textarea_title">Natural language Proof:</h3>
//         <p className="app_textarea_content">{NLproof}</p>
//       </div>

//       <div className="app_inputdiv">
//         <p>Enter the step</p>
//         <input
//           className="app_inputdiv_input"
//           onChange={(e) => setUpdate(e.target.value)}
//         />
//         <button className="app_inputdiv_button" onClick={handleUpdateAndOpenURL}>
//           Translate
//         </button>
//       </div>
//       <button onClick={handleReset}>Reset</button>
//     </div>
//   );
// };

// export default Gptcom;





























// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const Gptcom = () => {
//   const [leanCode, setLeanCode] = useState(() => {
//     // Check if there's a saved value in local storage, otherwise return the initial value
//     return localStorage.getItem('leanCode') || `theorem prop_example (p q r : Prop) : ((p \\/ q) -> r) <-> ((p -> r) \\/ (q -> r)) :=
//     begin
//     `;
//   });
//   const [question, setQuestion] = useState('');
//   const [update, setUpdate] = useState('');
//   const [NLproof, setNLproof] = useState(() => {
//     // Check if there's a saved value in local storage, otherwise return the initial value
//     return localStorage.getItem('NLproof') ||  `p or q implies r if and only if p implies r or  q implies r`;
//   })

//   useEffect(() => {
//     // Save the leanCode state to local storage whenever it changes
//     localStorage.setItem('leanCode', leanCode);
//   }, [leanCode]);
//   useEffect(() => {
//     // Save the leanCode state to local storage whenever it changes
//     localStorage.setItem('NLproof', NLproof);
//   }, [NLproof]);

//   const handleUpdateAndOpenURL = async () => {
//     try {
//       const response = await axios.post('http://localhost:3000/update', {
//         update: update,
//       });

//       setLeanCode((prevLeanCode) => prevLeanCode + `\n` + response.data.leanCode);
//       setNLproof((prevNLproof) => prevNLproof + `\n` + update);

//       // Call handleOpenURL whenever leanCode gets updated
//       handleOpenURL(leanCode);
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   };

//   const handleOpenURL = async (leanCode) => {
//     try {
//       const response = await axios.post('http://localhost:3000/open-url', { leanCode });
//       console.log('URL opened successfully');
//       const fullHttpUrl = response.data.fullHttpUrl;

//       // Update the URL with the new fullHttpUrl
//       window.location.replace(fullHttpUrl);
//       window.location.reload();
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   };

//   const handleReset = () => {
//     const initialLeanCode = `theorem prop_example (p q r : Prop) : ((p \\/ q) -> r) <-> ((p -> r) \\/ (q -> r)) :=
//       begin
//     `;
//     const initialNLproof = `p or q implies r if and only if p implies r or  q implies r`;

//     // Update leanCode
//     setLeanCode(initialLeanCode);
//     setNLproof(initialNLproof);

//     // Save the updated initialLeanCode to local storage
//     localStorage.setItem('leanCode', initialLeanCode);
//   };

//   return (
//     <div className="app">
//       {/* Input for question (if needed)
//       <div className="app_inputdiv">
//         <p>Enter the question</p>
//         <input
//           className="app_inputdiv_input"
//           onChange={(e) => setQuestion(e.target.value)}
//         />
//         <button className="app_inputdiv_button" onClick={handleQuestion}>
//           Run
//         </button>
//       </div>
//       */}

//       <div className="app_textarea">
//         <h3 className="app_textarea_title">Natural language Proof:</h3>
//         <p className="app_textarea_content">{NLproof}</p>
//       </div>

//       <div className="app_inputdiv">
//         <p>Enter the step</p>
//         <input
//           className="app_inputdiv_input"
//           onChange={(e) => setUpdate(e.target.value)}
//         />
//         <button className="app_inputdiv_button" onClick={handleUpdateAndOpenURL}>
//           Translate
//         </button>
//       </div>
//       <button onClick={handleReset}>Reset</button>
//     </div>
//   );
// };

// export default Gptcom;


// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const Gptcom = () => {
//   const [leanCode, setLeanCode] = useState(() => {
//     // Check if there's a saved value in local storage, otherwise return the initial value
//     return localStorage.getItem('leanCode') || `theorem prop_example (p q r : Prop) : ((p \\/ q) -> r) <-> ((p -> r) \\/ (q -> r)) :=
//     begin
//     `;
//   });
//   const [question, setQuestion] = useState('');
//   const [update, setUpdate] = useState('');
//   const [NLproof, setNLproof] = useState(() => {
//     // Check if there's a saved value in local storage, otherwise return the initial value
//     return localStorage.getItem('NLproof') || `p or q implies r if and only if p implies r or  q implies r`;
//   });

//   useEffect(() => {
//     // Save the leanCode state to local storage whenever it changes
//     localStorage.setItem('leanCode', leanCode);
//   }, [leanCode]);
//   useEffect(() => {
//     // Save the leanCode state to local storage whenever it changes
//     localStorage.setItem('NLproof', NLproof);
//   }, [NLproof]);

//   const handleUpdateAndOpenURL = async () => {
//     try {
//       const response = await axios.post('http://localhost:3000/update', {
//         update: update,
//       });

//       setLeanCode((prevLeanCode) => prevLeanCode + `\n` + response.data.leanCode);
//       setNLproof((prevNLproof) => prevNLproof + `\n` + update);

//       // Call handleOpenURL whenever leanCode gets updated
//       handleOpenURL(leanCode);
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   };

//   const handleOpenURL = async (leanCode) => {
//     try {
//       const response = await axios.post('http://localhost:3000/open-url', { leanCode });
//       console.log('URL opened successfully');
//       const fullHttpUrl = response.data.fullHttpUrl;

//       // Update the URL with the new fullHttpUrl
//       window.location.replace(fullHttpUrl);
//       window.location.reload();
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   };

//   const handleReset = () => {
//     const initialLeanCode = `theorem prop_example (p q r : Prop) : ((p \\/ q) -> r) <-> ((p -> r) \\/ (q -> r)) :=
//       begin
//     `;
//     const initialNLproof = `p or q implies r if and only if p implies r or  q implies r`;

//     // Update leanCode
//     setLeanCode(initialLeanCode);
//     setNLproof(initialNLproof);

//     // Save the updated initialLeanCode to local storage
//     localStorage.setItem('leanCode', initialLeanCode);
//   };

//   // Helper function to split NLproof into separate lines
//   const getNLproofLines = () => {
//     return NLproof.split('.').map((line, index) => (
//       <p key={index} className="app_textarea_line">
//         {line.trim()}
//       </p>
//     ));
//   };

//   return (
//     <div className="app">
//       {/* Input for question (if needed) */}
//       {/* ... (you can uncomment this section if you need to handle a question input) */}

//       <div className="app_textarea">
//         <h3 className="app_textarea_title">Natural language Proof:</h3>
//         {/* Display each line separately */}
//         {getNLproofLines()}
//       </div>

//       <div className="app_inputdiv">
//         <p>Enter the step</p>
//         <input
//           className="app_inputdiv_input"
//           onChange={(e) => setUpdate(e.target.value)}
//         />
//         <button className="app_inputdiv_button" onClick={handleUpdateAndOpenURL}>
//           Translate
//         </button>
//       </div>
//       <button onClick={handleReset}>Reset</button>
//     </div>
//   );
// };

// export default Gptcom;

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Gptcom = () => {
  const [leanCode, setLeanCode] = useState(() => {
    // Check if there's a saved value in local storage, otherwise return the initial value
    return localStorage.getItem('leanCode') || `example : ¬ true → false :=
begin
    `;
  });
  const [question, setQuestion] = useState('');
  const [update, setUpdate] = useState('');
  const [Toggle, setToggle] = useState(false);
  const [NLproof, setNLproof] = useState(() => {
    // Check if there's a saved value in local storage, otherwise return the initial value
    return localStorage.getItem('NLproof') || `p or q implies r if and only if p implies r or  q implies r.`;
  });

  useEffect(() => {
    // Save the leanCode state to local storage whenever it changes
    localStorage.setItem('leanCode', leanCode);
    handleOpenURL(leanCode);
  }, [leanCode]);
  useEffect(() => {
    // Save the leanCode state to local storage whenever it changes
    localStorage.setItem('NLproof', NLproof);
  }, [NLproof]);

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

  // a function that waits for the lean code to be updated and then opens the URL
  

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
    const initialLeanCode = `example : ¬ true → false :=
    begin.
    `;
    const initialNLproof = `p or q implies r if and only if p implies r or  q implies r.`;

    // Update leanCode
    setLeanCode(initialLeanCode);
    setNLproof(initialNLproof);

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
      {/* Input for question (if needed) */}
      {/* ... (you can uncomment this section if you need to handle a question input) */}

      <div className="app_textarea">
        <h3 className="app_textarea_title">Natural language Proof:</h3>
        {/* Display each line separately */}
        {getNLproofLines()}
      </div>

      <div className="app_inputdiv">
        <div className="app_inputdiv_input">
        <input
          className="app_inputdiv_input_input" placeholder="Enter the step"
          onChange={(e) => setUpdate(e.target.value)}
        />
        <button className="app_inputdiv_input_button" onClick={handleUpdateAndOpenURL}>
          Translate
        </button>
        </div>
        <button id="reset" onClick={handleReset}>Reset</button>
      </div>

    </div>
  );
};

export default Gptcom;
