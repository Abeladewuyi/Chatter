import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import { followUser, unfollowUser } from "../firebase/follow";

export function useFollow(currentUid, targetUid) {
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (!currentUid || !targetUid) return;

    const followingRef = doc(db, "users", currentUid, "following", targetUid);
    const unsubscribe = onSnapshot(followingRef, (docSnap) => {
      setIsFollowing(docSnap.exists());
    });

    return unsubscribe;
  }, [currentUid, targetUid]);

  async function toggleFollow() {
    if (isFollowing) {
      await unfollowUser(currentUid, targetUid);
    } else {
      await followUser(currentUid, targetUid);
    }
  }

  return { isFollowing, toggleFollow };
}