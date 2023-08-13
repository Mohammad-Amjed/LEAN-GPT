import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./bool";

export default configureStore({
  reducer: {
    counter: counterReducer
  }
});
