// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDXPxpZEggYUjts0pnJSAzk50yGcH1Oddo",
  authDomain: "gatekeeper-2f6de.firebaseapp.com",
  projectId: "gatekeeper-2f6de",
  storageBucket: "gatekeeper-2f6de.firebasestorage.app",
  messagingSenderId: "574371804856",
  appId: "1:574371804856:web:16059f97eb2c694699264d",
  measurementId: "G-R1V87GR2CZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);