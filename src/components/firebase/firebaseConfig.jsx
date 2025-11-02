// src/firebase.config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database'; // Importa la función para la base de datos
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage"; // Add this import
import { collection, addDoc } from "firebase/firestore";



const firebaseConfig = {
    apiKey: "AIzaSyCVbe_HdaWJEkDAVBfwehi9EyGFLrirTsw",
    authDomain: "calcae.firebaseapp.com",
    projectId: "calcae",
    storageBucket: "calcae.firebasestorage.app",
    messagingSenderId: "95476953005",
    appId: "1:95476953005:web:412135c76d49b45965bb24",
    measurementId: "G-YR4H8LHQB3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// activando sericios
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export { collection, addDoc };

