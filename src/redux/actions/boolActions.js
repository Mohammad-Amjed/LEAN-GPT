// boolActions.js
export const updateTacticPrediction = (bool) => {
  return {
    type: "UPDATE_TACTIC_PREDICTION",
    payload: bool
  };
};