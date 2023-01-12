// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBxRVq0e3dTAhUz_QVFXGZkgqyYonTa1Pc",
  authDomain: "publisher-7e91f.firebaseapp.com",
  projectId: "publisher-7e91f",
  storageBucket: "publisher-7e91f.appspot.com",
  messagingSenderId: "137920786548",
  appId: "1:137920786548:web:7af3261f27882b3fdc2121",
  measurementId: "G-5BN7F5DFJR",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)
