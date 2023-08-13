// import textAction from "./textAction";
// import boolAction from "./boolActions"

// const allActions = {
//   textAction,
//   boolAction
// };

// export default allActions;


// allActions.js
import textAction from "./textAction";
import { updateTacticPrediction } from "./boolActions"; // Import the named export

const allActions = {
  textAction,
  updateTacticPrediction // Use the named export here
};

export default allActions;