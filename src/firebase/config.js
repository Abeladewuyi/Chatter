import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// These values come from your Firebase project settings (Project settings > General > Your apps).
// They live in a .env.local file (never committed to git) so your keys aren't hardcoded here.
// Note: Firebase's client-side API keys are not secret in the way a server API key is — they're
// safe to ship to the browser. Your actual protection comes from Firestore Security Rules,
// which we'll write in a later stage.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

// We export these three instances once, then import them wherever we need
// auth (login/signup), db (Firestore reads/writes), or storage (image uploads).
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
});
export const storage = getStorage(app);
