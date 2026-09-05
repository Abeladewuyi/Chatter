import { collection, addDoc, doc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

/**
 * We copy (denormalize) the author's username, display name, and photo onto
 * the post itself, rather than looking them up fresh every time someone
 * views it. One Firestore read shows a whole feed with author info attached,
 * instead of one extra read per post.
 *
 * Trade-off: if the author later changes their name/photo, old posts still
 * show what they looked like at posting time. That's normal for social apps.
 */
export async function createPost({ authorId, authorUsername, authorDisplayName, authorPhotoURL, text, tags = [], poll = null }) {
  await addDoc(collection(db, "posts"), {
    authorId,
    authorUsername,
    authorDisplayName,
    authorPhotoURL: authorPhotoURL || "",
    text,
    tags,
    poll,
    likesCount: 0,
    commentsCount: 0,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "users", authorId), {
    postsCount: increment(1),
  });
}