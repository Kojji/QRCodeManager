// Firebase configuration
import { initializeApp } from "firebase/app";

// Add the Firebase products and methods that you want to use
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.FIREBASE_APIKEY,
  authDomain: import.meta.env.FIREBASE_AUTHDOMAIN,
  projectId: import.meta.env.FIREBASE_PROJECTID,
  storageBucket: import.meta.env.FIREBASE_STORAGEBUCKET,
  messagingSenderId: import.meta.env.FIREBASE_MESSAGINGSENDERID,
  appId: import.meta.env.FIREBASE_APPID,
  //   measurementId: process.env.
};

console.log(firebaseConfig);

export const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const auth = getAuth(app);
