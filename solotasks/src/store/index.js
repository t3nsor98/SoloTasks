import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import questsReducer from "./slices/questsSlice";
import userStatsReducer from "./slices/userStatsSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    quests: questsReducer,
    userStats: userStatsReducer,
    ui: uiReducer,
  },
});
