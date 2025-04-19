// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAuXuBI0G22QhDHJFayyDqRlR4SaoIQ_Mo",
  authDomain: "solotasks-6b433.firebaseapp.com",
  projectId: "solotasks-6b433",
  storageBucket: "solotasks-6b433.firebasestorage.app",
  messagingSenderId: "179222290452",
  appId: "1:179222290452:web:6f5dd0cc87038d81bcc701",
  measurementId: "G-EYHF8VK9R3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
