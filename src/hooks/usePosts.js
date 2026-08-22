import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase/config";

export function usePosts(authorIds) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authorIds || authorIds.length === 0) {
      setPosts([]);
      setLoading(false);
      return;
    }

    const cappedIds = authorIds.slice(0, 10);

    const postsQuery = query(
      collection(db, "posts"),
      where("authorId", "in", cappedIds),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      postsQuery,
      (snapshot) => {
        const nextPosts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPosts(nextPosts);
        setLoading(false);
      },
      (err) => {
        // Keep the existing posts on screen if the connection
        // temporarily fails. Firestore will attempt to reconnect.
        console.error("Firestore feed connection error:", err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [JSON.stringify(authorIds)]);

  return { posts, loading };
}