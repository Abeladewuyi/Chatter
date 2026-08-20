import { doc, writeBatch, serverTimestamp, increment } from "firebase/firestore";
import { db } from "./config";

/**
 * Following someone touches FOUR documents at once. We use a writeBatch so
 * all four either succeed together or fail together.
 */
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