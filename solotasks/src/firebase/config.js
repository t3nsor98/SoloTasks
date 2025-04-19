// src/firebase/config.js
import { initializeApp } from "firebase/app";
import {
  getAnalytics,
  isSupported as isAnalyticsSupported,
} from "firebase/analytics";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import {
  getFirestore,
  enableMultiTabIndexedDbPersistence,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey:
    import.meta.env.REACT_APP_FIREBASE_API_KEY ||
    "AIzaSyAuXuBI0G22QhDHJFayyDqRlR4SaoIQ_Mo",
  authDomain:
    import.meta.env.REACT_APP_FIREBASE_AUTH_DOMAIN ||
    "solotasks-6b433.firebaseapp.com",
  projectId: import.meta.env.REACT_APP_FIREBASE_PROJECT_ID || "solotasks-6b433",
  storageBucket:
    import.meta.env.REACT_APP_FIREBASE_STORAGE_BUCKET ||
    "solotasks-6b433.firebasestorage.app",
  messagingSenderId:
    import.meta.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "179222290452",
  appId:
    import.meta.env.REACT_APP_FIREBASE_APP_ID ||
    "1:179222290452:web:6f5dd0cc87038d81bcc701",
  measurementId:
    import.meta.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-EYHF8VK9R3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error setting auth persistence:", error);
});

// Initialize Firestore with offline persistence
const db = getFirestore(app);
if (typeof window !== "undefined") {
  enableMultiTabIndexedDbPersistence(db).catch((err) => {
    console.error("Firestore persistence failed to enable:", err.code);
    if (err.code === "failed-precondition") {
      console.warn(
        "Multiple tabs open, persistence can only be enabled in one tab at a time."
      );
    } else if (err.code === "unimplemented") {
      console.warn(
        "The current browser does not support all of the features required to enable persistence"
      );
    }
  });
}

// Initialize Storage
const storage = getStorage(app);

// Initialize Analytics only in browser environment and if supported
let analytics = null;
if (typeof window !== "undefined") {
  isAnalyticsSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch((error) => {
      console.error("Analytics support check failed:", error);
    });
}

export { auth, db, storage, analytics, app };
