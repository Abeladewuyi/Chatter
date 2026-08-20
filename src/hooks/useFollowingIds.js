import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

export function useFollowingIds(uid) {
  const [followingIds, setFollowingIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    const unsubscribe = onSnapshot(collection(db, "users", uid, "following"), (snapshot) => {
      setFollowingIds(snapshot.docs.map((d) => d.id));
      setLoading(false);
    });

    return unsubscribe;
  }, [uid]);

  return { followingIds, loading };
}