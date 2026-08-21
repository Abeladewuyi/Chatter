import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import { createNotification } from "./notifications";

export function getConversationId(uidA, uidB) {
  return [uidA, uidB].sort().join("_");
}

export async function ensureConversation(currentUid, otherUid) {
  const conversationId = getConversationId(currentUid, otherUid);
  const convRef = doc(db, "conversations", conversationId);
  const existing = await getDoc(convRef);

  if (!existing.exists()) {
    await setDoc(convRef, {
      participants: [currentUid, otherUid],
      lastMessage: "",
      lastMessageAt: serverTimestamp(),
    });
  }

  return conversationId;
}

export async function sendMessage(conversationId, senderId, recipientId, text) {
  await addDoc(collection(db, "conversations", conversationId, "messages"), {
    senderId,
    text,
    createdAt: serverTimestamp(),
    read: false,
  });

  await updateDoc(doc(db, "conversations", conversationId), {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
  });

  await createNotification({
    toUserId: recipientId,
    fromUserId: senderId,
    type: "message",
  });
}