import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "../firebase/config";

export function useNotifications(uid) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    const notifQuery = query(
      collection(db, "notifications", uid, "items"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(notifQuery, (snapshot) => {
      setNotifications(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return unsubscribe;
  }, [uid]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function markAsRead(notificationId) {
    await updateDoc(doc(db, "notifications", uid, "items", notificationId), { read: true });
  }

  async function markAllAsRead() {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;

    const batch = writeBatch(db);
    unread.forEach((n) => {
      batch.update(doc(db, "notifications", uid, "items", n.id), { read: true });
    });
    await batch.commit();
  }

  return { notifications, loading, unreadCount, markAsRead, markAllAsRead };
}