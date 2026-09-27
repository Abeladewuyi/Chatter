import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  increment,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { createNotification } from "../firebase/notifications";

export function useComments(postId, postAuthorId) {
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

  async function addComment({
    authorId,
    authorUsername,
    authorDisplayName,
    authorPhotoURL,
    text,
    parentCommentId = null,
    parentAuthorId = null,
  }) {
    const commentRef = await addDoc(collection(db, "posts", postId, "comments"), {
      authorId,
      authorUsername,
      authorDisplayName,
      authorPhotoURL: authorPhotoURL || "",
      text,
      parentCommentId,
      likesCount: 0,
      createdAt: serverTimestamp(),
    });

    await updateDoc(doc(db, "posts", postId), { commentsCount: increment(1) });

    const notificationRecipient = parentAuthorId || postAuthorId;
    if (notificationRecipient) {
      await createNotification({
        toUserId: notificationRecipient,
        fromUserId: authorId,
        type: "comment",
        postId,
        commentId: commentRef.id,
      });
    }
  }

  async function deleteComment(commentId) {
    const commentIds = [];

    function collectCommentAndReplies(parentId) {
      commentIds.push(parentId);
      comments
        .filter((comment) => comment.parentCommentId === parentId)
        .forEach((reply) => collectCommentAndReplies(reply.id));
    }

    collectCommentAndReplies(commentId);

    const batch = writeBatch(db);
    commentIds.forEach((id) => {
      batch.delete(doc(db, "posts", postId, "comments", id));
    });
    batch.update(doc(db, "posts", postId), {
      commentsCount: increment(-commentIds.length),
    });
    await batch.commit();
  }

  return { comments, loading, addComment, deleteComment };
}