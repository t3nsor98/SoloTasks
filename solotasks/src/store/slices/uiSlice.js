import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    notifications: [],
    theme: "default", // default, elite, monarch, etc.
    showSidebar: true,
    showNotification: false,
    notificationContent: null,
  },
  reducers: {
    addNotification: (state, action) => {
      state.notifications.push(action.payload);
      state.showNotification = true;
      state.notificationContent = action.payload;
    },
    clearNotification: (state) => {
      state.showNotification = false;
      state.notificationContent = null;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.showSidebar = !state.showSidebar;
    },
  },
});

export const { addNotification, clearNotification, setTheme, toggleSidebar } =
  uiSlice.actions;
export default uiSlice.reducer;
