import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { db } from "../firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export const fetchUserStats = createAsyncThunk(
  "userStats/fetchUserStats",
  async (userId, thunkAPI) => {
    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        return thunkAPI.rejectWithValue("User stats not found");
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const updateUserXP = createAsyncThunk(
  "userStats/updateUserXP",
  async ({ userId, xpToAdd }, thunkAPI) => {
    try {
      // Get current user stats
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return thunkAPI.rejectWithValue("User not found");
      }

      const userData = userSnap.data();
      const currentXP = userData.xp || 0;
      const currentLevel = userData.level || 1;
      const totalXP = (userData.totalXp || 0) + xpToAdd;

      // Calculate new XP and level
      const xpForNextLevel = currentLevel * 100; // Simple formula: level * 100 XP needed
      let newXP = currentXP + xpToAdd;
      let newLevel = currentLevel;
      let leveledUp = false;

      // Check if user leveled up
      if (newXP >= xpForNextLevel) {
        newXP = newXP - xpForNextLevel;
        newLevel = currentLevel + 1;
        leveledUp = true;
      }

      // Update user stats
      await updateDoc(userRef, {
        xp: newXP,
        level: newLevel,
        totalXp: totalXP,
        completedQuests: userData.completedQuests + 1,
        lastActive: new Date(),
      });

      return {
        xp: newXP,
        level: newLevel,
        totalXp: totalXP,
        leveledUp,
        completedQuests: userData.completedQuests + 1,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Add more thunks for updating streaks, achievements, etc.

const userStatsSlice = createSlice({
  name: "userStats",
  initialState: {
    level: 1,
    xp: 0,
    totalXp: 0,
    titles: [],
    currentTitle: "",
    achievements: [],
    streak: 0,
    lastActive: null,
    completedQuests: 0,
    isLoading: false,
    error: null,
    leveledUp: false,
  },
  reducers: {
    clearLevelUpNotification: (state) => {
      state.leveledUp = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.isLoading = false;
        return { ...state, ...action.payload, error: null };
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateUserXP.fulfilled, (state, action) => {
        state.xp = action.payload.xp;
        state.level = action.payload.level;
        state.totalXp = action.payload.totalXp;
        state.leveledUp = action.payload.leveledUp;
        state.completedQuests = action.payload.completedQuests;
      });
    // Add cases for other thunks
  },
});

export const { clearLevelUpNotification } = userStatsSlice.actions;
export default userStatsSlice.reducer;
