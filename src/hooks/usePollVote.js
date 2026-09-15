import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

/**
 * One vote per person, enforced the same way as likes: the vote doc's ID
 * IS the voter's uid, so a second vote attempt just overwrites — but we
 * block that in castVote() below rather than letting people switch votes,
 * to keep this simple for a practice app.
 *
 * NOTE on accuracy: updating vote counts here reads the post's current
 * poll data and writes back the whole options array with one count bumped.
 * Under two people voting in the exact same instant, one vote could
 * theoretically get lost (a "lost update") since this isn't wrapped in a
 * Firestore transaction. For a practice app with light traffic this is a
 * reasonable simplification — a production app with heavy concurrent
 * voting would want runTransaction() instead.
 */
export function usePollVote(postId, uid) {
  const [votedOptionId, setVotedOptionId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postId || !uid) return;

    const voteRef = doc(db, "posts", postId, "pollVotes", uid);
    const unsubscribe = onSnapshot(voteRef, (docSnap) => {
      setVotedOptionId(docSnap.exists() ? docSnap.data().optionId : null);
      setLoading(false);
    });

    return unsubscribe;
  }, [postId, uid]);

  async function castVote(optionId, currentPoll) {
    if (votedOptionId) return; // already voted, no changing votes in this version

    const voteRef = doc(db, "posts", postId, "pollVotes", uid);
    await setDoc(voteRef, { optionId, createdAt: serverTimestamp() });

    const updatedOptions = currentPoll.options.map((option) =>
      option.id === optionId ? { ...option, votes: (option.votes || 0) + 1 } : option
    );

    await updateDoc(doc(db, "posts", postId), {
      poll: { ...currentPoll, options: updatedOptions },
    });
  }

  return { votedOptionId, loading, castVote };
}