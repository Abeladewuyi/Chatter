import { Link } from "react-router-dom";
import { Heart, MessageCircle, UserPlus, Mail } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../hooks/useNotifications";
import { useUserProfile } from "../../hooks/useUserProfile";

const NOTIFICATION_TEXT = {
  follow: "started following you",
  like_post: "liked your post",
  comment: "commented on your post",
  like_comment: "liked your comment",
  message: "sent you a message",
};

const NOTIFICATION_ICON = {
  follow: UserPlus,
  like_post: Heart,
  comment: MessageCircle,
  like_comment: Heart,
  message: Mail,
};

function NotificationRow({ notification, onRead }) {
  const { profile } = useUserProfile(notification.fromUserId);
  const Icon = NOTIFICATION_ICON[notification.type] || Heart;

  const linkTo =
    notification.type === "follow"
      ? `/profile/${notification.fromUserId}`
      : notification.type === "message"
      ? `/messages/${notification.fromUserId}`
      : "/";

  if (!profile) return null;

  return (
    <Link
      to={linkTo}
      onClick={() => !notification.read && onRead(notification.id)}
      className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
        notification.read ? "border-border bg-surface" : "border-accent/40 bg-surface-2"
      }`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-sm font-semibold text-accent">
        {profile.photoURL ? (
          <img src={profile.photoURL} alt="" className="h-full w-full object-cover" />
        ) : (
          profile.displayName?.charAt(0).toUpperCase() || "?"
        )}
      </div>

      <div className="flex-1 text-sm text-text-primary">
        <span className="font-medium">{profile.displayName}</span>{" "}
        {NOTIFICATION_TEXT[notification.type] || "did something"}
      </div>

      <Icon size={16} className="shrink-0 text-text-muted" />
    </Link>
  );
}

export default function Notifications() {
  const { user } = useAuth();
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead } = useNotifications(user.uid);

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text-primary">Notifications</h1>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="text-sm text-accent hover:text-accent-hover">
            Mark all as read
          </button>
        )}
      </div>

      {loading && <p className="text-sm text-text-secondary">Loading notifications...</p>}

      {!loading && notifications.length === 0 && (
        <div className="rounded-2xl border border-border bg-surface p-8 text-center text-text-secondary">
          No notifications yet.
        </div>
      )}

      <div className="flex flex-col gap-2">
        {notifications.map((n) => (
          <NotificationRow key={n.id} notification={n} onRead={markAsRead} />
        ))}
      </div>
    </div>
  );
}