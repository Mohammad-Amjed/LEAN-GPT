const text = (state = { value: [] }, action) => {
    switch (action.type) {
      case "SET_TEXT":
        return {
          ...state,
          value: [...state.value, action.payload]
        };
      case "CLEAR_TEXT":
        return {
          ...state,
          value: []
        };
      default:
        return state;
    }
  };
  
  export default text;
  