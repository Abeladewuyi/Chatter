import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc, deleteDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { createNotification } from "../firebase/notifications";

export function useLike(postId, uid, postAuthorId) {
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (!postId || !uid) return;

    const likeRef = doc(db, "posts", postId, "likes", uid);
    const unsubscribe = onSnapshot(likeRef, (docSnap) => {
      setIsLiked(docSnap.exists());
    });

    return unsubscribe;
  }, [postId, uid]);

  async function toggleLike() {
    const likeRef = doc(db, "posts", postId, "likes", uid);
    const postRef = doc(db, "posts", postId);

    if (isLiked) {
      await deleteDoc(likeRef);
      await updateDoc(postRef, { likesCount: increment(-1) });
    } else {
      await setDoc(likeRef, { createdAt: serverTimestamp() });
      await updateDoc(postRef, { likesCount: increment(1) });

      if (postAuthorId) {
        await createNotification({
          toUserId: postAuthorId,
          fromUserId: uid,
          type: "like_post",
          postId,
        });
      }
    }
  }

  return { isLiked, toggleLike };
}