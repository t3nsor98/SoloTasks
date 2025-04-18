import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { auth, db } from "../firebase/config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const registerUser = createAsyncThunk(
  "auth/register",
  async ({ email, password, username }, thunkAPI) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Create initial user profile
      await setDoc(doc(db, "users", user.uid), {
        username,
        level: 1,
        xp: 0,
        totalXp: 0,
        titles: ["Novice Hunter"],
        currentTitle: "Novice Hunter",
        achievements: [],
        createdAt: new Date(),
        streak: 0,
        lastActive: new Date(),
        completedQuests: 0,
      });

      return { uid: user.uid, email: user.email, username };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Add login and logout thunks similarly

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
    // Add cases for login and logout
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
