import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';


const firebaseConfig = {
    apiKey: "AIzaSyBXX3JG_P4NU1RScHw7noMjajxUcxHC68M",
    authDomain: "sonhos-30bdd.firebaseapp.com",
    projectId: "sonhos-30bdd",
    storageBucket: "sonhos-30bdd.firebasestorage.app",
    messagingSenderId: "68564179339",
    appId: "1:68564179339:web:47644812d377771d94778e",
    measurementId: "G-B2PYSPKDV7"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };