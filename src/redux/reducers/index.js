import text from "./text";
import bool from "../bool"
import { combineReducers } from "redux";

const rootReducer = combineReducers({
  text,
  bool
});

export default rootReducer;
