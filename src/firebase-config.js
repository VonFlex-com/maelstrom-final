// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "@firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: "maelstrom-univ.firebaseapp.com",
    projectId: "maelstrom-univ",
    storageBucket: "maelstrom-univ.appspot.com",
    messagingSenderId: "856103535790",
    appId: "1:856103535790:web:8604f480e0a8525fa5193f",
    measurementId: "G-FPY7T6ZVNC"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);

export const db = getFirestore(app);