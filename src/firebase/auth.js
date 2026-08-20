import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";

/**
 * Creates a new Firebase Auth user AND a matching Firestore profile document.
 * We do both here, together, so a signed-up user always has a users/{uid} doc —
 * the rest of the app (profile page, posts, etc.) can assume that doc exists
 * without extra null-checks everywhere.
 */
export async function signUp({ email, password, username, displayName }) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, "users", user.uid), {
    username,
    displayName,
    bio: "",
    photoURL: "",
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    createdAt: serverTimestamp(),
  });

  return user;
}

export async function logIn({ email, password }) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

export async function logOut() {
  await signOut(auth);
}

export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Firebase throws error objects with a `code` like "auth/email-already-in-use".
 * This turns those codes into messages a user can actually understand,
 * instead of showing raw Firebase error text in the UI.
 */
export function getAuthErrorMessage(error) {
  switch (error.code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/invalid-email":
      return "That email address doesn't look right.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}
