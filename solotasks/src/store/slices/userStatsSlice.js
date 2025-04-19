// src/store/slices/userStatsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { db } from "../../firebase/config";
import {
  doc,
  getDoc,
  updateDoc,
  increment,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { checkAchievements } from "../../services/achievementsService";
import { addNotification } from "./uiSlice";
import { getTitleForLevel } from "../../utils/levelSystem";

/**
 * Helper function to serialize dates
 */
const serializeDates = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  if (obj instanceof Date) return obj.toISOString();
  if (obj.toDate && typeof obj.toDate === "function")
    return obj.toDate().toISOString();

  const result = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    result[key] = serializeDates(obj[key]);
  }
  return result;
};

/**
 * Fetch user stats from Firestore
 */
export const fetchUserStats = createAsyncThunk(
  "userStats/fetchUserStats",
  async (userId, thunkAPI) => {
    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // Serialize all Firestore data to avoid non-serializable values
        const userData = serializeDates(docSnap.data());

        // Update last active time with ISO string
        const now = new Date().toISOString();
        await updateDoc(docRef, {
          lastActive: now,
          serverTimestamp: serverTimestamp(),
        });

        return userData;
      } else {
        return thunkAPI.rejectWithValue("User stats not found");
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
      return thunkAPI.rejectWithValue(
        error.message || "Failed to fetch user stats"
      );
    }
  }
);

/**
 * Update user XP and handle level ups
 */
export const updateUserXP = createAsyncThunk(
  "userStats/updateUserXP",
  async (
    { userId, xpToAdd, questType = null, skipAchievementCheck = false },
    thunkAPI
  ) => {
    try {
      // Get current user stats
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return thunkAPI.rejectWithValue("User not found");
      }

      const userData = serializeDates(userSnap.data());
      const currentXP = userData.xp || 0;
      const currentLevel = userData.level || 1;
      const totalXP = (userData.totalXp || 0) + xpToAdd;

      // Calculate new XP and level
      const xpForNextLevel = currentLevel * 100; // Simple formula: level * 100 XP needed
      let newXP = currentXP + xpToAdd;
      let newLevel = currentLevel;
      let leveledUp = false;
      let newTitles = [...(userData.titles || ["Novice Hunter"])];
      let newTitle = userData.currentTitle || "Novice Hunter";

      // Check if user leveled up
      if (newXP >= xpForNextLevel) {
        newXP = newXP - xpForNextLevel;
        newLevel = currentLevel + 1;
        leveledUp = true;

        // Check if user earned a new title
        const levelTitle = getTitleForLevel(newLevel);
        if (levelTitle && !newTitles.includes(levelTitle)) {
          newTitles.push(levelTitle);
          newTitle = levelTitle;
        }
      }

      // Current time as ISO string
      const now = new Date().toISOString();

      // Prepare update data
      const updateData = {
        xp: newXP,
        level: newLevel,
        totalXp: totalXP,
        lastActive: now,
        serverTimestamp: serverTimestamp(),
      };

      // Update quest-specific counters if provided
      if (questType) {
        updateData.completedQuests = increment(1);

        if (questType === "daily") {
          updateData.completedDailyQuests = increment(1);
        } else if (questType === "weekly") {
          updateData.completedWeeklyQuests = increment(1);
        } else if (questType === "custom") {
          updateData.completedCustomQuests = increment(1);
        } else if (questType === "dungeon") {
          updateData.completedDungeons = increment(1);
        }
      }

      // Update titles if changed
      if (leveledUp && newTitles.length > userData.titles?.length) {
        updateData.titles = newTitles;
        updateData.currentTitle = newTitle;
      }

      // Add XP history entry
      updateData.xpHistory = arrayUnion({
        amount: xpToAdd,
        source: questType || "other",
        timestamp: now,
        newTotal: totalXP,
      });

      // Update user stats in Firestore
      await updateDoc(userRef, updateData);

      // Show level up notification if leveled up
      if (leveledUp && thunkAPI.dispatch) {
        thunkAPI.dispatch(
          addNotification({
            type: "success",
            title: "Level Up!",
            message: `You've reached level ${newLevel}!${
              newTitle !== userData.currentTitle
                ? ` New title unlocked: ${newTitle}`
                : ""
            }`,
            duration: 5000,
          })
        );
      }

      // Check for achievements if not skipped
      if (!skipAchievementCheck && thunkAPI.dispatch) {
        const updatedStats = {
          ...userData,
          xp: newXP,
          level: newLevel,
          totalXp: totalXP,
          completedQuests: (userData.completedQuests || 0) + 1,
          completedDailyQuests:
            questType === "daily"
              ? (userData.completedDailyQuests || 0) + 1
              : userData.completedDailyQuests || 0,
          completedWeeklyQuests:
            questType === "weekly"
              ? (userData.completedWeeklyQuests || 0) + 1
              : userData.completedWeeklyQuests || 0,
          completedCustomQuests:
            questType === "custom"
              ? (userData.completedCustomQuests || 0) + 1
              : userData.completedCustomQuests || 0,
          completedDungeons:
            questType === "dungeon"
              ? (userData.completedDungeons || 0) + 1
              : userData.completedDungeons || 0,
        };

        await checkAchievements(userId, updatedStats, thunkAPI.dispatch);
      }

      return {
        xp: newXP,
        level: newLevel,
        totalXp: totalXP,
        leveledUp,
        completedQuests: (userData.completedQuests || 0) + 1,
        titles: newTitles,
        currentTitle: newTitle,
        questType,
      };
    } catch (error) {
      console.error("Error updating user XP:", error);
      return thunkAPI.rejectWithValue(error.message || "Failed to update XP");
    }
  }
);

/**
 * Update user streak
 */
export const updateUserStreak = createAsyncThunk(
  "userStats/updateUserStreak",
  async (userId, thunkAPI) => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return thunkAPI.rejectWithValue("User not found");
      }

      const userData = serializeDates(userSnap.data());
      const currentStreak = userData.streak || 0;
      const lastActive = userData.lastActive
        ? new Date(userData.lastActive)
        : null;

      // Calculate if streak should be updated
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let newStreak = currentStreak;
      let streakUpdated = false;

      if (!lastActive) {
        // First activity
        newStreak = 1;
        streakUpdated = true;
      } else {
        const lastActiveDate = new Date(
          lastActive.getFullYear(),
          lastActive.getMonth(),
          lastActive.getDate()
        );

        if (lastActiveDate.getTime() === yesterday.getTime()) {
          // User was active yesterday, increment streak
          newStreak = currentStreak + 1;
          streakUpdated = true;
        } else if (lastActiveDate.getTime() === today.getTime()) {
          // Already active today, maintain streak
          streakUpdated = false;
        } else {
          // Streak broken, reset to 1
          newStreak = 1;
          streakUpdated = true;
        }
      }

      if (streakUpdated) {
        const nowIso = now.toISOString();
        await updateDoc(userRef, {
          streak: newStreak,
          lastActive: nowIso,
          serverTimestamp: serverTimestamp(),
          streakHistory: arrayUnion({
            streak: newStreak,
            date: nowIso,
          }),
        });

        // Check for streak achievements
        if (thunkAPI.dispatch) {
          const updatedStats = {
            ...userData,
            streak: newStreak,
          };

          await checkAchievements(userId, updatedStats, thunkAPI.dispatch);

          // Show streak notification for significant streaks
          if (
            newStreak === 3 ||
            newStreak === 7 ||
            newStreak === 30 ||
            newStreak % 10 === 0
          ) {
            thunkAPI.dispatch(
              addNotification({
                type: "success",
                title: "Streak Milestone!",
                message: `You've maintained a ${newStreak}-day streak!`,
                duration: 5000,
              })
            );
          }
        }
      }

      return {
        streak: newStreak,
        streakUpdated,
      };
    } catch (error) {
      console.error("Error updating user streak:", error);
      return thunkAPI.rejectWithValue(
        error.message || "Failed to update streak"
      );
    }
  }
);

/**
 * Update user title
 */
export const updateUserTitle = createAsyncThunk(
  "userStats/updateUserTitle",
  async ({ userId, title }, thunkAPI) => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return thunkAPI.rejectWithValue("User not found");
      }

      const userData = userSnap.data();
      const availableTitles = userData.titles || ["Novice Hunter"];

      if (!availableTitles.includes(title)) {
        return thunkAPI.rejectWithValue("Title not unlocked");
      }

      const now = new Date().toISOString();
      await updateDoc(userRef, {
        currentTitle: title,
        lastUpdated: now,
        serverTimestamp: serverTimestamp(),
      });

      return { currentTitle: title };
    } catch (error) {
      console.error("Error updating user title:", error);
      return thunkAPI.rejectWithValue(
        error.message || "Failed to update title"
      );
    }
  }
);

/**
 * Reset user stats (for testing/development)
 */
export const resetUserStats = createAsyncThunk(
  "userStats/resetUserStats",
  async (userId, thunkAPI) => {
    try {
      const userRef = doc(db, "users", userId);
      const now = new Date().toISOString();

      await updateDoc(userRef, {
        level: 1,
        xp: 0,
        streak: 0,
        completedQuests: 0,
        completedDailyQuests: 0,
        completedWeeklyQuests: 0,
        completedCustomQuests: 0,
        completedDungeons: 0,
        titles: ["Novice Hunter"],
        currentTitle: "Novice Hunter",
        lastReset: now,
        serverTimestamp: serverTimestamp(),
      });

      return {
        level: 1,
        xp: 0,
        streak: 0,
        completedQuests: 0,
        titles: ["Novice Hunter"],
        currentTitle: "Novice Hunter",
      };
    } catch (error) {
      console.error("Error resetting user stats:", error);
      return thunkAPI.rejectWithValue(error.message || "Failed to reset stats");
    }
  }
);

const userStatsSlice = createSlice({
  name: "userStats",
  initialState: {
    level: 1,
    xp: 0,
    totalXp: 0,
    titles: ["Novice Hunter"],
    currentTitle: "Novice Hunter",
    achievements: [],
    achievementHistory: [],
    streak: 0,
    lastActive: null,
    completedQuests: 0,
    completedDailyQuests: 0,
    completedWeeklyQuests: 0,
    completedCustomQuests: 0,
    completedDungeons: 0,
    xpHistory: [],
    streakHistory: [],
    isLoading: false,
    error: null,
    leveledUp: false,
    lastUpdated: null,
  },
  reducers: {
    clearLevelUpNotification: (state) => {
      state.leveledUp = false;
    },
    clearUserStatsError: (state) => {
      state.error = null;
    },
    setLastUpdated: (state) => {
      state.lastUpdated = new Date().toISOString();
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user stats
      .addCase(fetchUserStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.isLoading = false;

        // Update all properties from the fetched data
        // Keep existing state values for properties not in the payload
        Object.keys(action.payload).forEach((key) => {
          if (key in state) {
            state[key] = action.payload[key];
          }
        });

        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update user XP
      .addCase(updateUserXP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserXP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.xp = action.payload.xp;
        state.level = action.payload.level;
        state.totalXp = action.payload.totalXp;
        state.leveledUp = action.payload.leveledUp;
        state.completedQuests = action.payload.completedQuests;

        // Update quest-specific counters if provided
        if (action.payload.questType) {
          if (action.payload.questType === "daily") {
            state.completedDailyQuests = (state.completedDailyQuests || 0) + 1;
          } else if (action.payload.questType === "weekly") {
            state.completedWeeklyQuests =
              (state.completedWeeklyQuests || 0) + 1;
          } else if (action.payload.questType === "custom") {
            state.completedCustomQuests =
              (state.completedCustomQuests || 0) + 1;
          } else if (action.payload.questType === "dungeon") {
            state.completedDungeons = (state.completedDungeons || 0) + 1;
          }
        }

        // Update titles if provided
        if (action.payload.titles) {
          state.titles = action.payload.titles;
        }

        if (action.payload.currentTitle) {
          state.currentTitle = action.payload.currentTitle;
        }

        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateUserXP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update user streak
      .addCase(updateUserStreak.fulfilled, (state, action) => {
        if (action.payload.streakUpdated) {
          state.streak = action.payload.streak;
        }
        state.lastUpdated = new Date().toISOString();
      })

      // Update user title
      .addCase(updateUserTitle.fulfilled, (state, action) => {
        state.currentTitle = action.payload.currentTitle;
        state.lastUpdated = new Date().toISOString();
      })

      // Reset user stats
      .addCase(resetUserStats.fulfilled, (state, action) => {
        state.level = action.payload.level;
        state.xp = action.payload.xp;
        state.streak = action.payload.streak;
        state.completedQuests = action.payload.completedQuests;
        state.completedDailyQuests = 0;
        state.completedWeeklyQuests = 0;
        state.completedCustomQuests = 0;
        state.completedDungeons = 0;
        state.titles = action.payload.titles;
        state.currentTitle = action.payload.currentTitle;
        state.leveledUp = false;
        state.lastUpdated = new Date().toISOString();
      });
  },
});

export const { clearLevelUpNotification, clearUserStatsError, setLastUpdated } =
  userStatsSlice.actions;

export default userStatsSlice.reducer;
