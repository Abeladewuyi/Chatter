import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

export function useConversations(uid) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    const convQuery = query(
      collection(db, "conversations"),
      where("participants", "array-contains", uid),
      orderBy("lastMessageAt", "desc")
    );

    const unsubscribe = onSnapshot(convQuery, (snapshot) => {
      setConversations(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return unsubscribe;
  }, [uid]);

  return { conversations, loading };
}