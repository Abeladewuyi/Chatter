import { useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

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
console.log("POST DEBUG:", {
  authorIds,
  cappedIds,
});
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
        setError(null);
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