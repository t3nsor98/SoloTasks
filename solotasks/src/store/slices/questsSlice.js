import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

export const fetchQuests = createAsyncThunk(
  "quests/fetchQuests",
  async (userId, thunkAPI) => {
    try {
      const q = query(collection(db, "quests"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const quests = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return quests;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const addQuest = createAsyncThunk(
  "quests/addQuest",
  async (quest, thunkAPI) => {
    try {
      const docRef = await addDoc(collection(db, "quests"), quest);
      return { id: docRef.id, ...quest };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Add more thunks for updating and deleting quests

const questsSlice = createSlice({
  name: "quests",
  initialState: {
    quests: [],
    dailyQuests: [],
    weeklyQuests: [],
    customQuests: [],
    questChains: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchQuests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.quests = action.payload;
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
      })
      .addCase(fetchQuests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
    // Add cases for other thunks
  },
});

export default questsSlice.reducer;
