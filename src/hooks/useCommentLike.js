import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc, deleteDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { createNotification } from "../firebase/notifications";

export function useCommentLike(postId, commentId, uid, commentAuthorId) {
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

      if (commentAuthorId) {
        await createNotification({
          toUserId: commentAuthorId,
          fromUserId: uid,
          type: "like_comment",
          postId,
          commentId,
        });
      }
    }
  }

  return { isLiked, toggleLike };
}