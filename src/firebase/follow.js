import { doc, writeBatch, serverTimestamp, increment, collection } from "firebase/firestore";
import { db } from "./config";

export async function followUser(currentUid, targetUid) {
  const batch = writeBatch(db);

  batch.set(doc(db, "users", currentUid, "following", targetUid), {
    createdAt: serverTimestamp(),
  });
  batch.set(doc(db, "users", targetUid, "followers", currentUid), {
    createdAt: serverTimestamp(),
  });
  batch.update(doc(db, "users", currentUid), { followingCount: increment(1) });
  batch.update(doc(db, "users", targetUid), { followersCount: increment(1) });

  if (targetUid !== currentUid) {
    const notifRef = doc(collection(db, "notifications", targetUid, "items"));
    batch.set(notifRef, {
      type: "follow",
      fromUserId: currentUid,
      postId: null,
      commentId: null,
      read: false,
      createdAt: serverTimestamp(),
    });
  }

  await batch.commit();
}

export async function unfollowUser(currentUid, targetUid) {
  const batch = writeBatch(db);

  batch.delete(doc(db, "users", currentUid, "following", targetUid));
  batch.delete(doc(db, "users", targetUid, "followers", currentUid));
  batch.update(doc(db, "users", currentUid), { followingCount: increment(-1) });
  batch.update(doc(db, "users", targetUid), { followersCount: increment(-1) });

  await batch.commit();
}