// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';  // For authentication
import { getFirestore } from 'firebase/firestore'; // For Firestore
import { getAnalytics } from 'firebase/analytics'; // If you need analytics
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC99OIi__Se_-cnTsem0WWk1a6aiWMJdTk",
  authDomain: "localbites-894f3.firebaseapp.com",
  projectId: "localbites-894f3",
  storageBucket: "localbites-894f3.appspot.com",
  messagingSenderId: "732660793619",
  appId: "1:732660793619:web:77488989d0dd959bcc5ae6",
  measurementId: "G-BHFJS4LY4X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app); // For authentication
const firestore = getFirestore(app); // For Firestore
const analytics = getAnalytics(app); // For analytics (if needed)
const storage = getStorage(app);

export { app, auth, firestore, analytics, storage };