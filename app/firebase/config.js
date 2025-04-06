import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBUOU_ZpwMVC7GNVPHD4j5TlclXZwuRKFE",
  authDomain: "kingdoom-squad.firebaseapp.com",
  projectId: "kingdoom-squad",
  storageBucket: "kingdoom-squad.firebasestorage.app",
  messagingSenderId: "975808120334",
  appId: "1:975808120334:web:6bb60937e734b1cdabde5f",
  measurementId: "G-Y75R7NCVBG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only on client side
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Initialize Auth
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

export { app, analytics, auth, db }; 