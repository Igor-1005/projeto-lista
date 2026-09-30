import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCmO7nNbBGGTacQkZNM4AnaB2ku03nqUXQ",
  authDomain: "projeto-faculdade-2d2ae.firebaseapp.com",
  projectId: "projeto-faculdade-2d2ae",
  storageBucket: "projeto-faculdade-2d2ae.firebasestorage.app",
  messagingSenderId: "880776101899",
  appId: "1:880776101899:web:aad6ae30600e5c653ac70e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);
export const db = getFirestore(app);