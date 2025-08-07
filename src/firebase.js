// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add your web app's Firebase configuration
// Replace this with the firebaseConfig object you copied from the Firebase console
const firebaseConfig = {
    apiKey: "AIzaSyA8ygepAvhMD446wbrSWSNR_cOGhG5Jv0I",
    authDomain: "tradingdashboard-a2acb.firebaseapp.com",
    projectId: "tradingdashboard-a2acb",
    storageBucket: "tradingdashboard-a2acb.firebasestorage.app",
    messagingSenderId: "257501450542",
    appId: "1:257501450542:web:29e8626191094cbcc0eabf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services and export them
export const auth = getAuth(app);
export const db = getFirestore(app);