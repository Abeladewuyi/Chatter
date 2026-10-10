import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, UserPlus, Mail, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../hooks/useNotifications";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useFollow } from "../../hooks/useFollow";
import { usePost } from "../../hooks/usePost";

const NOTIFICATION_TEXT = {
  follow: "started following you",
  mention: "mentioned you",
  like_post: "liked your post",
  comment: "commented on your post",
  like_comment: "liked your comment",
  message: "sent you a message",
};

const NOTIFICATION_ICON = {
  follow: UserPlus,
  mention: MessageCircle,
  like_post: Heart,
  comment: MessageCircle,
  like_comment: Heart,
  message: Mail,
};

function NotificationRow({ notification, onRead, currentUid }) {
  const { profile } = useUserProfile(notification.fromUserId);
  const { isFollowing, toggleFollow } = useFollow(currentUid, notification.fromUserId);
  const { post } = usePost(notification.postId);
  const Icon = NOTIFICATION_ICON[notification.type] || Heart;

  const linkTo =
    notification.type === "follow"
      ? `/profile/${notification.fromUserId}`
      : notification.type === "message"
      ? `/messages/${notification.fromUserId}`
      : notification.postId
      ? `/post/${notification.postId}`
      : "/";

  if (!profile) return null;

  async function handleFollowBack() {
    await toggleFollow();
    if (!notification.read) await onRead(notification.id);
  }

  const isLikePost = notification.type === "like_post";
  const previewImage = isLikePost && post?.imageURL ? post.imageURL : null;

  return (
    <div
      className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${
        notification.read ? "bg-transparent" : "bg-white/3"
      }`}
    >
      <Link
        to={linkTo}
        onClick={() => !notification.read && onRead(notification.id)}
        aria-label={`View ${profile.displayName}'s profile`}
        className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-sm font-semibold text-accent"
      >
        {profile.photoURL ? (
          <img src={profile.photoURL} alt="" className="h-full w-full object-cover" />
        ) : (
          profile.displayName?.charAt(0).toUpperCase() || "?"
        )}
      </Link>

      <Link
        to={linkTo}
        onClick={() => !notification.read && onRead(notification.id)}
        className="flex min-w-0 flex-1 items-center gap-2 text-sm text-text-primary"
      >
        <span className="min-w-0 flex-1">
          <span className="font-medium">{profile.displayName}</span>{" "}
          {NOTIFICATION_TEXT[notification.type] || "did something"}
        </span>

        {notification.type !== "follow" && (
          <Icon size={16} className="shrink-0 text-text-muted" />
        )}
      </Link>

      {previewImage && (
        <Link
          to={linkTo}
          onClick={() => !notification.read && onRead(notification.id)}
          className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2"
        >
          <img src={previewImage} alt="Post preview" className="h-full w-full object-cover" />
        </Link>
      )}

      {notification.type === "follow" && (
        isFollowing ? (
          <Link
            to={`/messages/${notification.fromUserId}`}
            onClick={() => !notification.read && onRead(notification.id)}
            className="shrink-0 rounded-full bg-surface-2 px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-surface"
          >
            Message
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleFollowBack}
            className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-gray-200"
          >
            Follow back
          </button>
        )
      )}
    </div>
  );
}

export default function Notifications() {
  const { user } = useAuth();
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead } = useNotifications(user.uid);
  const [showAllFollows, setShowAllFollows] = useState(false);

  const followNotifications = notifications.filter((n) => n.type === "follow");
  const mentionNotifications = notifications.filter((n) => n.type === "mention");
  const likeNotifications = notifications.filter((n) => n.type === "like_post");
  const visibleFollowNotifications = showAllFollows ? followNotifications : followNotifications.slice(0, 4);
  const mentionOrLikeNotifications = mentionNotifications.length > 0 ? mentionNotifications : likeNotifications;

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
        <div className="rounded-2xl bg-transparent p-8 text-center text-text-secondary">
          No notifications yet.
        </div>
      )}

      {!loading && notifications.length > 0 && (
        <div className="flex flex-col gap-6">
          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">Follows</h2>

            {followNotifications.length === 0 ? (
              <p className="rounded-xl bg-transparent p-3 text-sm text-text-secondary">
                No new followers yet.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {visibleFollowNotifications.map((n) => (
                  <NotificationRow key={n.id} notification={n} onRead={markAsRead} currentUid={user.uid} />
                ))}

                {followNotifications.length > 4 && (
                  <button
                    type="button"
                    onClick={() => setShowAllFollows((current) => !current)}
                    className="mt-1 inline-flex items-center gap-1 self-start text-sm font-medium text-accent hover:text-accent-hover"
                  >
                    {showAllFollows ? "Show less" : "See more"}
                    {showAllFollows ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                )}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">Mentions</h2>

            {mentionOrLikeNotifications.length === 0 ? (
              <p className="rounded-xl bg-transparent p-3 text-sm text-text-secondary">
                No mentions yet.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {mentionOrLikeNotifications.map((n) => (
                  <NotificationRow key={n.id} notification={n} onRead={markAsRead} currentUid={user.uid} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}