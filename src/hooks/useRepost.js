import { useEffect, useState } from "react";
import { doc, increment, onSnapshot, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "../firebase/config";

export function useRepost(path, uid, countPath, repostData = null) {
  const [isReposted, setIsReposted] = useState(false);
  const pathKey = path.join("/");

  useEffect(() => {
    if (!path || !uid) return;

    const repostRef = doc(db, ...path, "reposts", uid);
    return onSnapshot(repostRef, (snapshot) => setIsReposted(snapshot.exists()));
  }, [pathKey, uid]);

  async function toggleRepost() {
    const repostRef = doc(db, ...path, "reposts", uid);
    const targetRef = doc(db, ...countPath);
    const batch = writeBatch(db);
    const profileRepostRef = repostData?.id
      ? doc(db, "users", uid, "reposts", repostData.id)
      : null;

    if (isReposted) {
      batch.delete(repostRef);
      batch.update(targetRef, { repostsCount: increment(-1) });
      if (profileRepostRef) batch.delete(profileRepostRef);
    } else {
      batch.set(repostRef, { createdAt: serverTimestamp() });
      batch.update(targetRef, { repostsCount: increment(1) });
      if (profileRepostRef) {
        batch.set(profileRepostRef, {
          ...repostData,
          originalPostId: repostData.id,
          repostedAt: serverTimestamp(),
        });
      }
    }

    await batch.commit();
  }

  return { isReposted, toggleRepost };
}