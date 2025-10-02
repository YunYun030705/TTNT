// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBeXLb_nswpv6QoqiLgXK3nZypZcAy3W2s",
  authDomain: "student-attendance-syste-83b22.firebaseapp.com",
  projectId: "student-attendance-syste-83b22",
  storageBucket: "student-attendance-syste-83b22.firebasestorage.app",
  messagingSenderId: "334753420863",
  appId: "1:334753420863:web:116e6a95696621a8ba0a8a",
  measurementId: "G-MRFF1G3X49",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

let analytics;
if (typeof window !== "undefined") {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.log("Analytics not available");
  }
}
export { analytics };

export default app;
