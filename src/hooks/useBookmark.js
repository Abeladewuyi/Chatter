import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

export function useBookmark(postId, uid) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (!postId || !uid) return;

    const bookmarkRef = doc(db, "users", uid, "bookmarks", postId);
    const unsubscribe = onSnapshot(bookmarkRef, (docSnap) => {
      setIsBookmarked(docSnap.exists());
    });

    return unsubscribe;
  }, [postId, uid]);

  async function toggleBookmark() {
    const bookmarkRef = doc(db, "users", uid, "bookmarks", postId);

    if (isBookmarked) {
      await deleteDoc(bookmarkRef);
    } else {
      await setDoc(bookmarkRef, { createdAt: serverTimestamp() });
    }
  }

  return { isBookmarked, toggleBookmark };
}