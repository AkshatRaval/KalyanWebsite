// 🔹 Import Firebase SDK for Browser
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// 🔥 Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyCJf0804ry7dOyILYB1S5qiyFrjt8YckSw",
    authDomain: "gcg-test-d21b3.firebaseapp.com",
    projectId: "gcg-test-d21b3",
    storageBucket: "gcg-test-d21b3.firebasestorage.app",
    messagingSenderId: "491512708288",
    appId: "1:491512708288:web:054c994c16b8c4b1a88125",
    measurementId: "G-2G853CCSLJ"
  };

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Export modules for the browser
export { auth, db };
