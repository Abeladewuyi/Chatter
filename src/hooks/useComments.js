import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

export function useComments(postId) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postId) return;

    const commentsQuery = query(
      collection(db, "posts", postId, "comments"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      setComments(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return unsubscribe;
  }, [postId]);

  async function addComment({ authorId, authorUsername, authorDisplayName, authorPhotoURL, text }) {
    await addDoc(collection(db, "posts", postId, "comments"), {
      authorId,
      authorUsername,
      authorDisplayName,
      authorPhotoURL: authorPhotoURL || "",
      text,
      createdAt: serverTimestamp(),
    });

    await updateDoc(doc(db, "posts", postId), { commentsCount: increment(1) });
  }

  async function deleteComment(commentId) {
    await deleteDoc(doc(db, "posts", postId, "comments", commentId));
    await updateDoc(doc(db, "posts", postId), { commentsCount: increment(-1) });
  }

  return { comments, loading, addComment, deleteComment };
}