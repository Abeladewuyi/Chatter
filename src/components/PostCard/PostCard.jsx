import { useState } from "react";
import { Link } from "react-router-dom";
import { doc, deleteDoc, updateDoc, increment } from "firebase/firestore";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import { useLike } from "../../hooks/useLike";
import { useFollow } from "../../hooks/useFollow";
import { useBookmark } from "../../hooks/useBookmark";
import CommentSection from "../CommentSection/CommentSection";

function formatTimestamp(timestamp) {
  if (!timestamp) return "Just now";
  const date = timestamp.toDate();
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
}

export default function PostCard({ post }) {
  const { user } = useAuth();
  const { isLiked, toggleLike } = useLike(post.id, user.uid, post.authorId);
  const { isFollowing, toggleFollow } = useFollow(user.uid, post.authorId);
  const { isBookmarked, toggleBookmark } = useBookmark(post.id, user.uid);
  const [showComments, setShowComments] = useState(false);

  const isOwnPost = post.authorId === user.uid;

  async function handleDelete() {
    if (!confirm("Delete this post?")) return;
    await deleteDoc(doc(db, "posts", post.id));
    await updateDoc(doc(db, "users", user.uid), { postsCount: increment(-1) });
  }

  return (
    // Card-free: no box/background, just a thin bottom border separating posts
    <div className="border-b border-white/10 py-4">
      <div className="flex items-start justify-between">
        <Link to={`/profile/${post.authorId}`} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-sm font-semibold text-text-primary">
            {post.authorPhotoURL ? (
              <img src={post.authorPhotoURL} alt="" className="h-full w-full object-cover" />
            ) : (
              post.authorDisplayName?.charAt(0).toUpperCase() || "?"
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">{post.authorDisplayName}</p>
            <p className="text-xs text-text-muted">
              @{post.authorUsername} · {formatTimestamp(post.createdAt)}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {!isOwnPost && (
            <button
              onClick={toggleFollow}
              className={
                isFollowing
                  ? "rounded-full border border-border px-3 py-1 text-xs text-text-secondary hover:border-text-primary hover:text-text-primary"
                  : "rounded-full bg-accent px-3 py-1 text-xs font-medium text-on-accent hover:bg-accent-hover"
              }
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          )}

          {isOwnPost && (
            <button onClick={handleDelete} className="text-text-muted hover:text-red-400">
              <MoreHorizontal size={18} />
            </button>
          )}
        </div>
      </div>

      {post.imageURL && (
        <img src={post.imageURL} alt="" className="mt-3 w-full rounded-2xl object-cover" />
      )}

      <p className="mt-3 whitespace-pre-wrap text-sm text-text-primary">{post.text}</p>

      <div className="mt-4 flex items-center justify-between text-text-secondary">
        <div className="flex items-center gap-6">
          <button
            onClick={toggleLike}
            className={`flex items-center gap-1.5 text-sm hover:text-text-primary ${
              isLiked ? "text-text-primary" : ""
            }`}
          >
            <Heart size={17} fill={isLiked ? "currentColor" : "none"} />
            {post.likesCount ?? 0}
          </button>

          <button
            onClick={() => setShowComments((prev) => !prev)}
            className="flex items-center gap-1.5 text-sm hover:text-text-primary"
          >
            <MessageCircle size={17} />
            {post.commentsCount ?? 0}
          </button>

          <button className="flex items-center gap-1.5 text-sm hover:text-text-primary">
            <Send size={17} />
          </button>
        </div>

        <button
          onClick={toggleBookmark}
          className={`hover:text-text-primary ${isBookmarked ? "text-text-primary" : ""}`}
        >
          <Bookmark size={17} fill={isBookmarked ? "currentColor" : "none"} />
        </button>
      </div>

      {showComments && <CommentSection postId={post.id} postAuthorId={post.authorId} autoFocus />}
    </div>
  );
}