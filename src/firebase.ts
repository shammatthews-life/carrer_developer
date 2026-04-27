import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA52FrTD2QYR5Y0aQpQHBmoT3s6q3SnU-I",
  authDomain: "career-trainer-a2c7c.firebaseapp.com",
  projectId: "career-trainer-a2c7c",
  storageBucket: "career-trainer-a2c7c.firebasestorage.app",
  messagingSenderId: "795441459775",
  appId: "1:795441459775:web:22b9b6e81b7f127af57e8a",
  measurementId: "G-491TX7TE68"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
