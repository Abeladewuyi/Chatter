import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

/**
 * For now this shows ALL posts, newest first — a simple global feed.
 * In Stage 4 we'll filter this down to only posts from people you follow.
 */
export function usePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const postsQuery = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(50));

    const unsubscribe = onSnapshot(
      postsQuery,
      (snapshot) => {
        const postList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPosts(postList);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return { posts, loading, error };
}