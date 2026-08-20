import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc, deleteDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

export function useCommentLike(postId, commentId, uid) {
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (!postId || !commentId || !uid) return;

    const likeRef = doc(db, "posts", postId, "comments", commentId, "likes", uid);
    const unsubscribe = onSnapshot(likeRef, (docSnap) => {
      setIsLiked(docSnap.exists());
    });

    return unsubscribe;
  }, [postId, commentId, uid]);

  async function toggleLike() {
    const likeRef = doc(db, "posts", postId, "comments", commentId, "likes", uid);
    const commentRef = doc(db, "posts", postId, "comments", commentId);

    if (isLiked) {
      await deleteDoc(likeRef);
      await updateDoc(commentRef, { likesCount: increment(-1) });
    } else {
      await setDoc(likeRef, { createdAt: serverTimestamp() });
      await updateDoc(commentRef, { likesCount: increment(1) });
    }
  }

  return { isLiked, toggleLike };
}