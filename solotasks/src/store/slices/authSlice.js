// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { auth, db, storage } from "../../firebase/config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

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
 * Register a new user
 */
export const registerUser = createAsyncThunk(
  "auth/register",
  async ({ email, password, username }, thunkAPI) => {
    try {
      // Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Default profile data
      const defaultTitles = ["Novice Hunter"];
      const defaultTitle = "Novice Hunter";
      const creationTime = new Date().toISOString(); // Use ISO string for Firestore compatibility

      // Create initial user profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        username,
        email,
        level: 1,
        xp: 0,
        totalXp: 0,
        titles: defaultTitles,
        currentTitle: defaultTitle,
        achievements: [],
        achievementHistory: [],
        createdAt: creationTime,
        lastActive: creationTime,
        lastLogin: creationTime,
        streak: 0,
        completedQuests: 0,
        completedDailyQuests: 0,
        completedWeeklyQuests: 0,
        completedCustomQuests: 0,
        completedDungeons: 0,
        serverTimestamp: serverTimestamp(), // Use server timestamp for time synchronization
      });

      return {
        uid: user.uid,
        email: user.email,
        username,
        createdAt: creationTime,
      };
    } catch (error) {
      // Format error message for better user experience
      let errorMessage = "Registration failed";

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already in use";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (error.message) {
        errorMessage = error.message;
      }

      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

/**
 * Log in an existing user
 */
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, thunkAPI) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Get user profile data from Firestore
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        // Serialize the Firestore data to avoid non-serializable values
        const userData = serializeDates(userDoc.data());

        // Current time as ISO string
        const now = new Date().toISOString();

        // Update last login time
        await updateDoc(userRef, {
          lastLogin: now,
          lastActive: now,
          serverTimestamp: serverTimestamp(),
        });

        // Check and update streak
        // Note: We need to parse the ISO string back to Date for date comparison
        const lastActive = userData.lastActive
          ? new Date(userData.lastActive)
          : null;
        if (lastActive) {
          const nowDate = new Date();
          const yesterday = new Date(nowDate);
          yesterday.setDate(yesterday.getDate() - 1);

          // If last active was yesterday, continue streak
          // If last active was today, maintain streak
          // Otherwise, reset streak to 1
          if (
            lastActive.toDateString() === yesterday.toDateString() ||
            lastActive.toDateString() === nowDate.toDateString()
          ) {
            // Streak continues or maintains
          } else {
            // Reset streak
            await updateDoc(userRef, { streak: 1 });
          }
        }

        return {
          uid: user.uid,
          email: user.email,
          username: userData.username,
          profileImageUrl: userData.profileImageUrl,
          createdAt: userData.createdAt,
        };
      }

      return { uid: user.uid, email: user.email };
    } catch (error) {
      // Format error message for better user experience
      let errorMessage = "Login failed";

      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed login attempts. Please try again later";
      } else if (error.code === "auth/user-disabled") {
        errorMessage = "This account has been disabled";
      } else if (error.message) {
        errorMessage = error.message;
      }

      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

/**
 * Log out the current user
 */
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, thunkAPI) => {
    try {
      // Update last active time before logging out
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, {
          lastActive: new Date().toISOString(), // Use ISO string
          serverTimestamp: serverTimestamp(),
        });
      }

      await signOut(auth);
      return null;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || "Logout failed");
    }
  }
);

/**
 * Update user profile
 */
export const updateUserProfile = createAsyncThunk(
  "auth/updateProfile",
  async ({ userId, data, profileImage }, thunkAPI) => {
    try {
      const userRef = doc(db, "users", userId);
      const updateData = { ...data };

      // Upload profile image if provided
      if (profileImage) {
        const storageRef = ref(storage, `profile-images/${userId}`);
        await uploadBytes(storageRef, profileImage);
        const imageUrl = await getDownloadURL(storageRef);
        updateData.profileImageUrl = imageUrl;
      }

      // Update timestamp as ISO string
      updateData.lastUpdated = new Date().toISOString();

      await updateDoc(userRef, updateData);

      // Return serialized data to avoid non-serializable values
      return serializeDates(updateData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.message || "Failed to update profile"
      );
    }
  }
);

/**
 * Send password reset email
 */
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (email, thunkAPI) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return email;
    } catch (error) {
      let errorMessage = "Failed to send password reset email";

      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (error.message) {
        errorMessage = error.message;
      }

      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

/**
 * Update user email
 */
export const updateUserEmail = createAsyncThunk(
  "auth/updateEmail",
  async ({ currentPassword, newEmail }, thunkAPI) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        return thunkAPI.rejectWithValue("User not authenticated");
      }

      // Re-authenticate user before changing email
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update email in Firebase Auth
      await updateEmail(user, newEmail);

      // Update email in Firestore with ISO string date
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        email: newEmail,
        lastUpdated: new Date().toISOString(),
      });

      return { email: newEmail };
    } catch (error) {
      let errorMessage = "Failed to update email";

      if (error.code === "auth/requires-recent-login") {
        errorMessage = "Please log in again before changing your email";
      } else if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already in use";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password";
      } else if (error.message) {
        errorMessage = error.message;
      }

      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

/**
 * Update user password
 */
export const updateUserPassword = createAsyncThunk(
  "auth/updatePassword",
  async ({ currentPassword, newPassword }, thunkAPI) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        return thunkAPI.rejectWithValue("User not authenticated");
      }

      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      // Update last updated timestamp in Firestore using ISO string
      const now = new Date().toISOString();
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        passwordUpdatedAt: now,
        lastUpdated: now,
      });

      return { success: true };
    } catch (error) {
      let errorMessage = "Failed to update password";

      if (error.code === "auth/requires-recent-login") {
        errorMessage = "Please log in again before changing your password";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect current password";
      } else if (error.message) {
        errorMessage = error.message;
      }

      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isLoading: false,
    error: null,
    passwordResetSent: false,
    profileUpdateSuccess: false,
  },
  reducers: {
    setUser: (state, action) => {
      // Ensure any date objects in the payload are serialized
      state.user = action.payload ? serializeDates(action.payload) : null;
      state.isLoading = false;
    },
    updateProfile: (state, action) => {
      if (state.user) {
        // Ensure any date objects in the payload are serialized
        state.user = { ...state.user, ...serializeDates(action.payload) };
      }
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    clearProfileUpdateSuccess: (state) => {
      state.profileUpdateSuccess = false;
    },
    clearPasswordResetStatus: (state) => {
      state.passwordResetSent = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Logout cases
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update profile cases
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.profileUpdateSuccess = false;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.user) {
          state.user = { ...state.user, ...action.payload };
        }
        state.profileUpdateSuccess = true;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.profileUpdateSuccess = false;
      })

      // Password reset cases
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.passwordResetSent = false;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.passwordResetSent = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update email cases
      .addCase(updateUserEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.user) {
          state.user.email = action.payload.email;
        }
      })
      .addCase(updateUserEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update password cases
      .addCase(updateUserPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateUserPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setUser,
  updateProfile,
  clearAuthError,
  clearProfileUpdateSuccess,
  clearPasswordResetStatus,
} = authSlice.actions;

export default authSlice.reducer;
