import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyDaRd59vLUt2xazjhfbn5vT1GLge4NvqCQ",
  authDomain: "projectplacement-86d76.firebaseapp.com",
  projectId: "projectplacement-86d76",
  storageBucket: "projectplacement-86d76.firebasestorage.app",
  messagingSenderId: "319835590014",
  appId: "1:319835590014:web:1d7b8a9b7718494803372f",
  measurementId: "G-8BHKR5D1VQ"
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);