import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Send, Bookmark } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLike } from "../../hooks/useLike";
import { useFollow } from "../../hooks/useFollow";
import { useBookmark } from "../../hooks/useBookmark";
import { useRepost } from "../../hooks/useRepost";
import CommentSection from "../CommentSection/CommentSection";
import PollDisplay from "../PollDisplay/PollDisplay";

function animateActionIcon(event, keyframes) {
  event.currentTarget.querySelector("svg")?.animate(keyframes, {
    duration: 360,
    easing: "ease-out",
  });
}

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

export default function PostCard({ post, showComments = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isLiked, toggleLike } = useLike(post.id, user.uid, post.authorId);
  const { isFollowing, toggleFollow } = useFollow(user.uid, post.authorId);
  const { isBookmarked, toggleBookmark } = useBookmark(post.id, user.uid);
  const { isReposted, toggleRepost } = useRepost(
    ["posts", post.id],
    user.uid,
    ["posts", post.id],
    post
  );

  return (
    // Card-free: no box/background, just a thin bottom border separating posts
    <div className="border-b border-white/10 py-4">
      <div className="flex items-center justify-between gap-3">
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
          {post.authorId !== user.uid && (
            <button
              type="button"
              onClick={toggleFollow}
              aria-pressed={isFollowing}
              aria-label={`${isFollowing ? "Unfollow" : "Follow"} ${post.authorDisplayName}`}
              className={
                isFollowing
                  ? "whitespace-nowrap rounded-full bg-black px-3 py-1 text-xs font-medium text-white transition hover:bg-neutral-900"
                  : "whitespace-nowrap rounded-full border border-white/15 bg-white px-3 py-1 text-xs font-medium text-black transition hover:bg-gray-200"
              }
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          )}
        </div>
      </div>

<p className="mt-3 whitespace-pre-wrap text-base text-text-primary">
  {post.text}
</p>

{(post.imageURLs?.length > 0 || post.imageURL) && (
  <div
    className={`mt-3 grid gap-2 ${
      (post.imageURLs?.length || 1) > 1 ? "grid-cols-2" : "grid-cols-1"
    }`}
  >
    {(post.imageURLs?.length ? post.imageURLs : [post.imageURL]).map(
      (imageURL, index) => (
        <img
          key={`${imageURL}-${index}`}
          src={imageURL}
          alt=""
className="max-h-80 w-full rounded-xl bg-surface-2 object-contain"        />
      )
    )}
  </div>
)}
      {post.poll && <PollDisplay postId={post.id} poll={post.poll} />}

      <div className="mt-4 flex items-center justify-between text-text-secondary">
        <div className="flex items-center gap-8">
          <button
            onClick={(event) => {
              animateActionIcon(event, [
                { transform: "scale(1)" },
                { transform: "scale(1.22)" },
                { transform: "scale(1)" },
              ]);
              toggleLike();
            }}
            className={`flex items-center gap-1.5 text-sm hover:text-text-primary ${
              isLiked ? "text-red-500" : ""
            }`}
          >
            <Heart size={25} fill={isLiked ? "currentColor" : "none"} />
            {post.likesCount ?? 0}
          </button>

          <button
            onClick={(event) => {
              animateActionIcon(event, [
                { transform: "translateY(0)" },
                { transform: "translateY(-3px)" },
                { transform: "translateY(0)" },
              ]);
              window.setTimeout(() => navigate(`/post/${post.id}`), 140);
            }}
            className="flex items-center gap-1.5 text-sm hover:text-text-primary"
          >
            <MessageCircle size={25} />
            {post.commentsCount ?? 0}
          </button>

          <button
            onClick={(event) => {
              animateActionIcon(event, [
                { transform: "rotate(0deg)" },
                { transform: "rotate(-12deg)" },
                { transform: "rotate(0deg)" },
              ]);
              toggleRepost();
            }}
            className={`flex items-center gap-1.5 text-sm hover:text-text-primary ${
              isReposted ? "text-accent" : ""
            }`}
            aria-pressed={isReposted}
          >
            <Send size={25} />
            {post.repostsCount ?? 0}
          </button>
        </div>

        <button
          onClick={(event) => {
            animateActionIcon(event, [
              { transform: "scaleY(1)" },
              { transform: "scaleY(0.82)" },
              { transform: "scaleY(1.08)" },
              { transform: "scaleY(1)" },
            ]);
            toggleBookmark();
          }}
          className={`hover:text-text-primary ${isBookmarked ? "text-text-primary" : ""}`}
        >
          <Bookmark size={27} fill={isBookmarked ? "currentColor" : "none"} />
        </button>
      </div>

      {showComments && <CommentSection postId={post.id} postAuthorId={post.authorId} autoFocus />}
    </div>
  );
}