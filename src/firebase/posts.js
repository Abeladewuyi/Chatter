import { collection, addDoc, doc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

export async function createPost({
  authorId,
  authorUsername,
  authorDisplayName,
  authorPhotoURL,
  text,
  imageURL = "",
  tags = [],
  poll = null,
}) {
  await addDoc(collection(db, "posts"), {
    authorId,
    authorUsername,
    authorDisplayName,
    authorPhotoURL: authorPhotoURL || "",
    text,
    imageURL,
    tags,
    poll, // { question, options: [{ id, text, votes }] } or null
    likesCount: 0,
    commentsCount: 0,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "users", authorId), {
    postsCount: increment(1),
  });
}