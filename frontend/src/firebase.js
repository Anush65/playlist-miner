// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCgNJrJ1bnqL6K1d_Rw6Fni5YZuN_b9C3Y",
  authDomain: "playlist-miner-auth.firebaseapp.com",
  projectId: "playlist-miner-auth",
  storageBucket: "playlist-miner-auth.firebasestorage.app",
  messagingSenderId: "376933414",
  appId: "1:376933414:web:dc7520c12baf1bcb53eae7",
  measurementId: "G-MJVT8J1VS9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
