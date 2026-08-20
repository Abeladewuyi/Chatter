import { useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

/**
 * Firestore's `in` operator only accepts up to 10 values. Fine for a
 * practice app; a real app with large follow lists needs a different
 * approach (e.g. a fan-out feed collection via Cloud Functions).
 */
export function usePosts(authorIds) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [JSON.stringify(authorIds)]);

  return { posts, loading, error };
}