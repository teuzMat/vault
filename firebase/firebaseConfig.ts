import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAjN57rX-Zlo1SYPVX1mmmth5RdTztwcHs",
  authDomain: "vaultzera.firebaseapp.com",
  projectId: "vaultzera",
  storageBucket: "vaultzera.firebasestorage.app",
  messagingSenderId: "678923010113",
  appId: "1:678923010113:web:60cf143c2c3507ddb6c6c0"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);