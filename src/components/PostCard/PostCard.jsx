import { useState } from "react";
import { doc, deleteDoc, updateDoc, increment } from "firebase/firestore";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import { useLike } from "../../hooks/useLike";
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
  const { isLiked, toggleLike } = useLike(post.id, user.uid);
  const [showComments, setShowComments] = useState(false);

  const isOwnPost = post.authorId === user.uid;

  async function handleDelete() {
    if (!confirm("Delete this post?")) return;
    await deleteDoc(doc(db, "posts", post.id));
    await updateDoc(doc(db, "users", user.uid), { postsCount: increment(-1) });
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-sm font-semibold text-accent">
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
        </div>

        {isOwnPost && (
          <button onClick={handleDelete} className="text-xs text-text-muted hover:text-red-400">
            Delete
          </button>
        )}
      </div>

      <p className="mt-3 whitespace-pre-wrap text-sm text-text-primary">{post.text}</p>

      <div className="mt-4 flex items-center gap-6 text-sm text-text-secondary">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1.5 hover:text-accent ${isLiked ? "text-accent" : ""}`}
        >
          <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
          {post.likesCount ?? 0}
        </button>

        <button
          onClick={() => setShowComments((prev) => !prev)}
          className="flex items-center gap-1.5 hover:text-accent"
        >
          <MessageCircle size={16} />
          {post.commentsCount ?? 0}
        </button>

        <button className="flex items-center gap-1.5 hover:text-accent">
          <Share2 size={16} />
          Share
        </button>
      </div>

      {showComments && <CommentSection postId={post.id} />}
    </div>
  );
}