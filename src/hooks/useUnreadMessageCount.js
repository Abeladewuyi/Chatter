import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase/config";

export function useUnreadMessageCount(uid) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!uid) {
      setCount(0);
      return;
    }

    const convQuery = query(
      collection(db, "conversations"),
      where("participants", "array-contains", uid)
    );

    const conversationUnsubs = [];
    const conversationCounts = new Map();

    const updateTotal = () => {
      const total = [...conversationCounts.values()].reduce((sum, value) => sum + value, 0);
      setCount(total);
    };

    const unsubscribeConversations = onSnapshot(
      convQuery,
      (snapshot) => {
        conversationUnsubs.forEach((stop) => stop());
        conversationCounts.clear();

        if (snapshot.empty) {
          setCount(0);
          return;
        }

        snapshot.docs.forEach((conversationDoc) => {
          const conversationId = conversationDoc.id;
          const messagesRef = collection(db, "conversations", conversationId, "messages");

          const unsubscribeMessages = onSnapshot(
            messagesRef,
            (messagesSnap) => {
              const unread = messagesSnap.docs.filter((messageDoc) => {
                const message = messageDoc.data();
                return message.senderId !== uid && message.read !== true;
              }).length;

              conversationCounts.set(conversationId, unread);
              updateTotal();
            },
            (err) => {
              console.error("useUnreadMessageCount message listener error:", err);
              conversationCounts.set(conversationId, 0);
              updateTotal();
            }
          );

          conversationUnsubs.push(unsubscribeMessages);
        });
      },
      (err) => {
        console.error("useUnreadMessageCount conversations listener error:", err);
        setCount(0);
      }
    );

    return () => {
      unsubscribeConversations();
      conversationUnsubs.forEach((stop) => stop());
    };
  }, [uid]);

  return { unreadMessageCount: count };
}
