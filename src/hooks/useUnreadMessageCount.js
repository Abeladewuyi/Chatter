import { useEffect, useState } from "react";
import { collection, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase/config";

export function useUnreadMessageCount(uid) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!uid) {
      setCount(0);
      return;
    }

    const convQuery = query(collection(db, "conversations"), where("participants", "array-contains", uid));

    const unsubscribe = onSnapshot(
      convQuery,
      async (snapshot) => {
        if (snapshot.empty) {
          setCount(0);
          return;
        }

        const conversationIds = snapshot.docs.map((doc) => doc.id);

        const totals = await Promise.all(
          conversationIds.map(async (conversationId) => {
            const messagesSnap = await getDocs(collection(db, "conversations", conversationId, "messages"));
            return messagesSnap.docs.filter((doc) => {
              const message = doc.data();
              return message.senderId !== uid && message.read !== true;
            }).length;
          })
        );

        setCount(totals.reduce((sum, value) => sum + value, 0));
      },
      (err) => {
        console.error("useUnreadMessageCount error:", err);
        setCount(0);
      }
    );

    return unsubscribe;
  }, [uid]);

  return { unreadMessageCount: count };
}
