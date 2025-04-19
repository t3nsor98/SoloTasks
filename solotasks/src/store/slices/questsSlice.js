// src/store/slices/questsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { db } from "../../firebase/config";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
  increment,
  getDoc,
  setDoc,
  arrayUnion,
} from "firebase/firestore";
import { checkSpecialAchievement } from "../../services/achievementsService";

// Utility to serialize Firestore Timestamps and JS Dates to ISO strings
function serializeDates(obj) {
  if (!obj || typeof obj !== "object") return obj;
  if (obj instanceof Date) return obj.toISOString();
  if (obj.toDate && typeof obj.toDate === "function")
    return obj.toDate().toISOString();
  const result = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    result[key] = serializeDates(obj[key]);
  }
  return result;
}

export const fetchQuests = createAsyncThunk(
  "quests/fetchQuests",
  async (userId, thunkAPI) => {
    try {
      const q = query(
        collection(db, "quests"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const quests = querySnapshot.docs.map((docSnap) => {
        const data = serializeDates(docSnap.data());
        return {
          id: docSnap.id,
          ...data,
        };
      });
      return quests;
    } catch (error) {
      console.error("Error fetching quests:", error);
      return thunkAPI.rejectWithValue(
        error.message || "Failed to fetch quests"
      );
    }
  }
);

export const addQuest = createAsyncThunk(
  "quests/addQuest",
  async (quest, thunkAPI) => {
    try {
      const now = new Date().toISOString();
      const questWithTimestamp = {
        ...quest,
        createdAt: now,
        dueDate: quest.dueDate ? new Date(quest.dueDate).toISOString() : now,
        serverTimestamp: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, "quests"), questWithTimestamp);

      // Update user's quest count in a separate collection for stats
      const userStatsRef = doc(db, "userStats", quest.userId);
      const userStatsDoc = await getDoc(userStatsRef);

      if (userStatsDoc.exists()) {
        await updateDoc(userStatsRef, {
          totalQuestsCreated: increment(1),
          [`${quest.type}QuestsCreated`]: increment(1),
          lastUpdated: serverTimestamp(),
        });
      } else {
        await setDoc(userStatsRef, {
          userId: quest.userId,
          totalQuestsCreated: 1,
          [`${quest.type}QuestsCreated`]: 1,
          dailyQuestsCreated: quest.type === "daily" ? 1 : 0,
          weeklyQuestsCreated: quest.type === "weekly" ? 1 : 0,
          customQuestsCreated: quest.type === "custom" ? 1 : 0,
          lastUpdated: serverTimestamp(),
        });
      }

      return {
        id: docRef.id,
        ...questWithTimestamp,
      };
    } catch (error) {
      console.error("Error adding quest:", error);
      return thunkAPI.rejectWithValue(error.message || "Failed to add quest");
    }
  }
);

export const completeQuest = createAsyncThunk(
  "quests/completeQuest",
  async (questId, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const quest = state.quests.quests.find((q) => q.id === questId);
      if (!quest) return thunkAPI.rejectWithValue("Quest not found");

      const completedAt = new Date().toISOString();

      const docRef = doc(db, "quests", questId);
      await updateDoc(docRef, {
        completed: true,
        completedAt,
        serverTimestamp: serverTimestamp(),
      });

      // Update user stats in a batch operation
      const batch = writeBatch(db);
      const userRef = doc(db, "users", quest.userId);
      batch.update(userRef, {
        completedQuests: increment(1),
        [`completed${
          quest.type.charAt(0).toUpperCase() + quest.type.slice(1)
        }Quests`]: increment(1),
        lastActive: completedAt,
        completedQuestHistory: arrayUnion({
          id: questId,
          title: quest.title,
          type: quest.type,
          xp: quest.xp,
          difficulty: quest.difficulty,
          completedAt,
        }),
      });
      const userStatsRef = doc(db, "userStats", quest.userId);
      batch.update(userStatsRef, {
        totalQuestsCompleted: increment(1),
        [`${quest.type}QuestsCompleted`]: increment(1),
        lastUpdated: serverTimestamp(),
      });
      await batch.commit();

      return {
        questId,
        completedAt,
        questType: quest.type,
      };
    } catch (error) {
      console.error("Error completing quest:", error);
      return thunkAPI.rejectWithValue(
        error.message || "Failed to complete quest"
      );
    }
  }
);

export const deleteQuest = createAsyncThunk(
  "quests/deleteQuest",
  async (questId, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const quest = state.quests.quests.find((q) => q.id === questId);
      if (!quest) return thunkAPI.rejectWithValue("Quest not found");

      const docRef = doc(db, "quests", questId);
      await deleteDoc(docRef);

      if (!quest.completed) {
        const userStatsRef = doc(db, "userStats", quest.userId);
        await updateDoc(userStatsRef, {
          [`${quest.type}QuestsDeleted`]: increment(1),
          totalQuestsDeleted: increment(1),
          lastUpdated: serverTimestamp(),
        });
      }

      return {
        questId,
        questType: quest.type,
      };
    } catch (error) {
      console.error("Error deleting quest:", error);
      return thunkAPI.rejectWithValue(
        error.message || "Failed to delete quest"
      );
    }
  }
);

export const completeQuestChain = createAsyncThunk(
  "quests/completeQuestChain",
  async ({ chainId, timeRemaining, timeLimit }, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const chain = state.quests.questChains.find((q) => q.id === chainId);
      if (!chain) return thunkAPI.rejectWithValue("Quest chain not found");

      const completedAt = new Date().toISOString();

      const docRef = doc(db, "quests", chainId);
      await updateDoc(docRef, {
        completed: true,
        completedAt,
        timeRemaining,
        serverTimestamp: serverTimestamp(),
      });

      const userRef = doc(db, "users", chain.userId);
      await updateDoc(userRef, {
        completedQuests: increment(1),
        completedDungeons: increment(1),
        lastActive: completedAt,
        completedQuestHistory: arrayUnion({
          id: chainId,
          title: chain.title,
          type: "dungeon",
          xp: chain.xp,
          difficulty: chain.difficulty,
          steps: chain.steps.length,
          timeRemaining,
          timeLimit,
          completedAt,
        }),
      });

      if (timeRemaining !== undefined && timeLimit !== undefined) {
        const dispatch = thunkAPI.dispatch;
        await checkSpecialAchievement(
          chain.userId,
          {
            type: "dungeon_completion",
            timeRemaining,
            timeLimit,
          },
          dispatch
        );
      }

      return {
        chainId,
        completedAt,
        timeRemaining,
        timeLimit,
      };
    } catch (error) {
      console.error("Error completing quest chain:", error);
      return thunkAPI.rejectWithValue(
        error.message || "Failed to complete dungeon run"
      );
    }
  }
);

export const updateQuest = createAsyncThunk(
  "quests/updateQuest",
  async ({ questId, updates }, thunkAPI) => {
    try {
      const docRef = doc(db, "quests", questId);
      const updatesWithTimestamp = {
        ...updates,
        updatedAt: new Date().toISOString(),
        serverTimestamp: serverTimestamp(),
      };
      await updateDoc(docRef, updatesWithTimestamp);
      return {
        questId,
        updates: updatesWithTimestamp,
      };
    } catch (error) {
      console.error("Error updating quest:", error);
      return thunkAPI.rejectWithValue(
        error.message || "Failed to update quest"
      );
    }
  }
);

export const resetDailyQuests = createAsyncThunk(
  "quests/resetDailyQuests",
  async (userId, thunkAPI) => {
    try {
      const q = query(
        collection(db, "quests"),
        where("userId", "==", userId),
        where("type", "==", "daily"),
        where("completed", "==", true)
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return { count: 0 };

      const batch = writeBatch(db);
      const now = new Date().toISOString();
      let count = 0;

      for (const docSnapshot of querySnapshot.docs) {
        const quest = docSnapshot.data();
        const newQuest = {
          title: quest.title,
          description: quest.description,
          type: "daily",
          difficulty: quest.difficulty,
          xp: quest.xp,
          userId,
          completed: false,
          createdAt: now,
          isReset: true,
          originalQuestId: docSnapshot.id,
          serverTimestamp: serverTimestamp(),
        };
        const newDocRef = doc(collection(db, "quests"));
        batch.set(newDocRef, newQuest);
        count++;
      }
      await batch.commit();
      return { count };
    } catch (error) {
      console.error("Error resetting daily quests:", error);
      return thunkAPI.rejectWithValue(
        error.message || "Failed to reset daily quests"
      );
    }
  }
);

const questsSlice = createSlice({
  name: "quests",
  initialState: {
    quests: [],
    dailyQuests: [],
    weeklyQuests: [],
    customQuests: [],
    questChains: [],
    completedQuests: [],
    isLoading: false,
    error: null,
    lastFetched: null,
    questStats: {
      totalActive: 0,
      totalCompleted: 0,
      dailyActive: 0,
      weeklyActive: 0,
      customActive: 0,
      chainsActive: 0,
    },
  },
  reducers: {
    clearQuestsError: (state) => {
      state.error = null;
    },
    updateQuestStats: (state) => {
      const activeQuests = state.quests.filter((q) => !q.completed);
      const completedQuests = state.quests.filter((q) => q.completed);
      state.questStats = {
        totalActive: activeQuests.length,
        totalCompleted: completedQuests.length,
        dailyActive: state.dailyQuests.filter((q) => !q.completed).length,
        weeklyActive: state.weeklyQuests.filter((q) => !q.completed).length,
        customActive: state.customQuests.filter((q) => !q.completed).length,
        chainsActive: state.questChains.filter((q) => !q.completed).length,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.quests = action.payload;
        state.lastFetched = new Date().toISOString();
        state.dailyQuests = action.payload.filter(
          (quest) => quest.type === "daily"
        );
        state.weeklyQuests = action.payload.filter(
          (quest) => quest.type === "weekly"
        );
        state.customQuests = action.payload.filter(
          (quest) => quest.type === "custom"
        );
        state.questChains = action.payload.filter((quest) => quest.isChain);
        state.completedQuests = action.payload.filter(
          (quest) => quest.completed
        );
        const activeQuests = action.payload.filter((q) => !q.completed);
        state.questStats = {
          totalActive: activeQuests.length,
          totalCompleted: state.completedQuests.length,
          dailyActive: state.dailyQuests.filter((q) => !q.completed).length,
          weeklyActive: state.weeklyQuests.filter((q) => !q.completed).length,
          customActive: state.customQuests.filter((q) => !q.completed).length,
          chainsActive: state.questChains.filter((q) => !q.completed).length,
        };
      })
      .addCase(fetchQuests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(addQuest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addQuest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.quests.unshift(action.payload);
        if (action.payload.type === "daily") {
          state.dailyQuests.unshift(action.payload);
          state.questStats.dailyActive++;
        } else if (action.payload.type === "weekly") {
          state.weeklyQuests.unshift(action.payload);
          state.questStats.weeklyActive++;
        } else if (action.payload.type === "custom") {
          state.customQuests.unshift(action.payload);
          state.questStats.customActive++;
        }
        if (action.payload.isChain) {
          state.questChains.unshift(action.payload);
          state.questStats.chainsActive++;
        }
        state.questStats.totalActive++;
      })
      .addCase(addQuest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(completeQuest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(completeQuest.fulfilled, (state, action) => {
        state.isLoading = false;
        const { questId, completedAt, questType } = action.payload;
        const updateQuestInArray = (arr) => {
          const index = arr.findIndex((q) => q.id === questId);
          if (index !== -1) {
            arr[index].completed = true;
            arr[index].completedAt = completedAt;
            state.completedQuests.unshift(arr[index]);
            state.questStats.totalCompleted++;
            state.questStats.totalActive--;
            if (questType === "daily") state.questStats.dailyActive--;
            else if (questType === "weekly") state.questStats.weeklyActive--;
            else if (questType === "custom") state.questStats.customActive--;
            if (arr[index].isChain) state.questStats.chainsActive--;
          }
        };
        updateQuestInArray(state.quests);
        updateQuestInArray(state.dailyQuests);
        updateQuestInArray(state.weeklyQuests);
        updateQuestInArray(state.customQuests);
        updateQuestInArray(state.questChains);
      })
      .addCase(completeQuest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteQuest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteQuest.fulfilled, (state, action) => {
        state.isLoading = false;
        const { questId, questType } = action.payload;
        const wasCompleted =
          state.quests.find((q) => q.id === questId)?.completed || false;
        const wasChain =
          state.quests.find((q) => q.id === questId)?.isChain || false;
        state.quests = state.quests.filter((q) => q.id !== questId);
        state.dailyQuests = state.dailyQuests.filter((q) => q.id !== questId);
        state.weeklyQuests = state.weeklyQuests.filter((q) => q.id !== questId);
        state.customQuests = state.customQuests.filter((q) => q.id !== questId);
        state.questChains = state.questChains.filter((q) => q.id !== questId);
        state.completedQuests = state.completedQuests.filter(
          (q) => q.id !== questId
        );
        if (wasCompleted) {
          state.questStats.totalCompleted--;
        } else {
          state.questStats.totalActive--;
          if (questType === "daily") state.questStats.dailyActive--;
          else if (questType === "weekly") state.questStats.weeklyActive--;
          else if (questType === "custom") state.questStats.customActive--;
          if (wasChain) state.questStats.chainsActive--;
        }
      })
      .addCase(deleteQuest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(completeQuestChain.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(completeQuestChain.fulfilled, (state, action) => {
        state.isLoading = false;
        const { chainId, completedAt } = action.payload;
        const updateQuestInArray = (arr) => {
          const index = arr.findIndex((q) => q.id === chainId);
          if (index !== -1) {
            arr[index].completed = true;
            arr[index].completedAt = completedAt;
            state.completedQuests.unshift(arr[index]);
            if (arr === state.questChains) state.questStats.chainsActive--;
            if (!arr[index].isChain) {
              if (arr[index].type === "daily") state.questStats.dailyActive--;
              else if (arr[index].type === "weekly")
                state.questStats.weeklyActive--;
              else if (arr[index].type === "custom")
                state.questStats.customActive--;
            }
            state.questStats.totalActive--;
            state.questStats.totalCompleted++;
          }
        };
        updateQuestInArray(state.quests);
        updateQuestInArray(state.questChains);
        updateQuestInArray(state.customQuests);
      })
      .addCase(completeQuestChain.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateQuest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateQuest.fulfilled, (state, action) => {
        state.isLoading = false;
        const { questId, updates } = action.payload;
        const updateQuestInArray = (arr) => {
          const index = arr.findIndex((q) => q.id === questId);
          if (index !== -1) {
            arr[index] = { ...arr[index], ...updates };
          }
        };
        updateQuestInArray(state.quests);
        updateQuestInArray(state.dailyQuests);
        updateQuestInArray(state.weeklyQuests);
        updateQuestInArray(state.customQuests);
        updateQuestInArray(state.questChains);
        updateQuestInArray(state.completedQuests);
      })
      .addCase(updateQuest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(resetDailyQuests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetDailyQuests.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(resetDailyQuests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearQuestsError, updateQuestStats } = questsSlice.actions;
export default questsSlice.reducer;
