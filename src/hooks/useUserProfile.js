import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

/**
 * Subscribes to a single user's profile document and keeps it in sync.
 * We use onSnapshot (not a one-time getDoc) so that if the user edits their
 * profile in one tab, or we update it after an image upload, this hook
 * picks up the change automatically without a page refresh.
 *
 * Usage: const { profile, loading, error } = useUserProfile(uid);
 */
export function useUserProfile(uid) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      doc(db, "users", uid),
      (docSnap) => {
        if (docSnap.exists()) {
          setProfile({ id: docSnap.id, ...docSnap.data() });
        } else {
          setProfile(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [uid]);

  return { profile, loading, error };
}