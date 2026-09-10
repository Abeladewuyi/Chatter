import { useEffect, useState } from "react";
import { deleteDoc, doc, increment, onSnapshot, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

export function useRepost(path, uid, countPath) {
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

    if (isReposted) {
      await deleteDoc(repostRef);
      await updateDoc(targetRef, { repostsCount: increment(-1) });
    } else {
      await setDoc(repostRef, { createdAt: serverTimestamp() });
      await updateDoc(targetRef, { repostsCount: increment(1) });
    }
  }

  return { isReposted, toggleRepost };
}