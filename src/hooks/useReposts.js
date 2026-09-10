import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase/config";

export function useReposts(uid) {
  const [reposts, setReposts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    const repostsQuery = query(
      collection(db, "users", uid, "reposts"),
      orderBy("repostedAt", "desc")
    );

    return onSnapshot(
      repostsQuery,
      (snapshot) => {
        setReposts(snapshot.docs.map((repost) => repost.data()));
        setLoading(false);
      },
      (error) => {
        console.error("Failed to load reposts:", error);
        setLoading(false);
      }
    );
  }, [uid]);

  return { reposts, loading };
}