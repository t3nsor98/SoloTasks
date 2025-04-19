// src/store/slices/uiSlice.js
import { createSlice } from "@reduxjs/toolkit";

// Available themes
export const THEMES = {
  DEFAULT: "default",
  ELITE: "elite",
  SHADOW: "shadow",
  MONARCH: "monarch",
  DARK: "dark",
};

// Max number of notifications to keep in history
const MAX_NOTIFICATIONS = 10;

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    notifications: [],
    theme: THEMES.DEFAULT,
    showSidebar: true,
    showNotification: false,
    notificationContent: null,
    isMobileView: false,
    isSearchOpen: false,
    searchQuery: "",
    lastAction: null,
    confirmDialog: {
      isOpen: false,
      title: "",
      message: "",
      confirmAction: null,
      cancelAction: null,
      type: "default", // default, warning, danger
    },
    tour: {
      isActive: false,
      currentStep: 0,
      completed: false,
    },
    preferences: {
      enableNotificationSounds: true,
      enableAnimations: true,
      compactMode: false,
      autoHideSidebar: false,
    },
  },
  reducers: {
    // Notification actions
    addNotification: (state, action) => {
      // Add to notifications array (limit to max size)
      state.notifications.unshift(action.payload);
      if (state.notifications.length > MAX_NOTIFICATIONS) {
        state.notifications = state.notifications.slice(0, MAX_NOTIFICATIONS);
      }

      state.showNotification = true;
      state.notificationContent = action.payload;
    },
    clearNotification: (state) => {
      state.showNotification = false;
      state.notificationContent = null;
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.showNotification = false;
      state.notificationContent = null;
    },
    markNotificationsAsRead: (state) => {
      state.notifications = state.notifications.map((notification) => ({
        ...notification,
        read: true,
      }));
    },

    // Theme actions
    setTheme: (state, action) => {
      state.theme = action.payload;
      // Apply theme to document for CSS variables
      document.documentElement.setAttribute("data-theme", action.payload);
    },

    // Sidebar actions
    toggleSidebar: (state) => {
      state.showSidebar = !state.showSidebar;
    },
    setSidebar: (state, action) => {
      state.showSidebar = action.payload;
    },

    // Mobile view actions
    setMobileView: (state, action) => {
      state.isMobileView = action.payload;
      // Auto-hide sidebar on mobile if preference is set
      if (action.payload && state.preferences.autoHideSidebar) {
        state.showSidebar = false;
      }
    },

    // Search actions
    toggleSearch: (state) => {
      state.isSearchOpen = !state.isSearchOpen;
      if (!state.isSearchOpen) {
        state.searchQuery = "";
      }
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },

    // Action tracking
    setLastAction: (state, action) => {
      state.lastAction = {
        type: action.payload.type,
        timestamp: new Date().toISOString(),
        details: action.payload.details || null,
      };
    },

    // Confirmation dialog
    openConfirmDialog: (state, action) => {
      state.confirmDialog = {
        isOpen: true,
        title: action.payload.title || "Confirm Action",
        message: action.payload.message || "Are you sure you want to proceed?",
        confirmAction: action.payload.confirmAction,
        cancelAction: action.payload.cancelAction,
        type: action.payload.type || "default",
      };
    },
    closeConfirmDialog: (state) => {
      state.confirmDialog.isOpen = false;
    },

    // Tour management
    startTour: (state) => {
      state.tour.isActive = true;
      state.tour.currentStep = 0;
    },
    nextTourStep: (state) => {
      state.tour.currentStep += 1;
    },
    prevTourStep: (state) => {
      if (state.tour.currentStep > 0) {
        state.tour.currentStep -= 1;
      }
    },
    endTour: (state, action) => {
      state.tour.isActive = false;
      state.tour.completed = action.payload || false;
    },

    // User preferences
    updatePreferences: (state, action) => {
      state.preferences = {
        ...state.preferences,
        ...action.payload,
      };

      // Apply preferences that affect UI immediately
      if (
        action.payload.autoHideSidebar !== undefined &&
        action.payload.autoHideSidebar &&
        state.isMobileView
      ) {
        state.showSidebar = false;
      }
    },

    // Reset UI state (for logout)
    resetUiState: (state) => {
      // Keep some user preferences but reset the rest
      const savedPreferences = { ...state.preferences };
      const savedTheme = state.theme;

      // Reset to initial state
      Object.assign(state, uiSlice.getInitialState());

      // Restore saved preferences
      state.preferences = savedPreferences;
      state.theme = savedTheme;
    },
  },
});

export const {
  addNotification,
  clearNotification,
  clearAllNotifications,
  markNotificationsAsRead,
  setTheme,
  toggleSidebar,
  setSidebar,
  setMobileView,
  toggleSearch,
  setSearchQuery,
  setLastAction,
  openConfirmDialog,
  closeConfirmDialog,
  startTour,
  nextTourStep,
  prevTourStep,
  endTour,
  updatePreferences,
  resetUiState,
} = uiSlice.actions;

export default uiSlice.reducer;
