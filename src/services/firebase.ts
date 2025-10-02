// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { config, validateConfig } from "../config";

// Validate configuration before initializing Firebase
if (!validateConfig()) {
  throw new Error("Invalid Firebase configuration. Please check your environment variables.");
}

// Your web app's Firebase configuration
const firebaseConfig = config.firebase;

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
