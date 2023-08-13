const bool = (state = { value: bool }, action) => {
  switch (action.type) {
    case "UPDATE_TACTIC_PREDICTION":
      return {
        ...state,
        value: action.payload
      };
    default:
      return state;
  }
};

export default bool;
