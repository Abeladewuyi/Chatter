import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

export async function createNotification({ toUserId, fromUserId, type, postId = null, commentId = null }) {
  if (toUserId === fromUserId) return;

  await addDoc(collection(db, "notifications", toUserId, "items"), {
    type,
    fromUserId,
    postId,
    commentId,
    read: false,
    createdAt: serverTimestamp(),
  });
}