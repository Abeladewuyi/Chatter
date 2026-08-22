import {
  doc,
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

/**
 * IMPORTANT: this does NOT read the conversation first to check if it
 * exists. Our security rules only allow reading a conversation once you're
 * already listed in its participants — but a brand-new conversation has no
 * data yet, so that read would always be denied (a "prove you're allowed
 * before there's anything to check" trap).
 *
 * Instead we just write our participants directly with merge:true. If the
 * doc doesn't exist, this counts as "create" under our rules (and we pass,
 * since we're listing ourselves as a participant). If it already exists,
 * this counts as "update" (and we still pass, since we're already a
 * participant) — merge:true means we don't touch lastMessage/lastMessageAt
 * on repeat visits, so we never wipe an existing conversation's preview text.
 */
export async function ensureConversation(currentUid, otherUid) {
  const conversationId = getConversationId(currentUid, otherUid);
  const convRef = doc(db, "conversations", conversationId);

  await setDoc(
    convRef,
    { participants: [currentUid, otherUid] },
    { merge: true }
  );

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