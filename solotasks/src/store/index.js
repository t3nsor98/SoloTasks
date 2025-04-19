// src/store/index.js
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { createLogger } from "redux-logger";

// Import reducers
import authReducer from "./slices/authSlice";
import questsReducer from "./slices/questsSlice";
import userStatsReducer from "./slices/userStatsSlice";
import uiReducer from "./slices/uiSlice";

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  quests: questsReducer,
  userStats: userStatsReducer,
  ui: uiReducer,
});

// Configuration for redux-persist
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "userStats"], // Only persist these reducers
  blacklist: [], // Don't persist these reducers
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Logger middleware for development
const logger = createLogger({
  collapsed: true,
  diff: true,
});

// Create store with appropriate middleware based on environment
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // Ignore these field paths in all actions
        ignoredActionPaths: [
          "payload.createdAt",
          "payload.dueDate",
          "payload.completedAt",
          "meta.arg.timestamp",
        ],
        // Ignore these field paths in the state
        ignoredPaths: [
          "quests.quests.createdAt",
          "quests.quests.dueDate",
          "quests.quests.completedAt",
          "userStats.lastActive",
        ],
      },
    }).concat(process.env.NODE_ENV === "development" ? [logger] : []),
  devTools: process.env.NODE_ENV !== "production",
});

// Create persistor
export const persistor = persistStore(store);

// Export a hook that can be reused to resolve types
export const getStoreState = () => store.getState();
