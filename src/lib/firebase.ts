import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDziE1th68B1TmQXGjUxulkkMnmhs0CQYY",
  authDomain: "vendor-4e695.firebaseapp.com",
  projectId: "vendor-4e695",
  storageBucket: "vendor-4e695.firebasestorage.app",
  messagingSenderId: "118907262509",
  appId: "1:118907262509:web:fefc05d756223ef7014aa4",
  measurementId: "G-GHP4GXVK2N"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db }; 