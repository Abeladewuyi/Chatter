import { useEffect, useRef, useState } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useComments } from "../../hooks/useComments";
import { useCommentLike } from "../../hooks/useCommentLike";

function CommentLikeButton({ postId, commentId, uid, commentAuthorId, likesCount }) {
  const { isLiked, toggleLike } = useCommentLike(postId, commentId, uid, commentAuthorId);

  return (
    <button
      onClick={toggleLike}
      className={`flex items-center gap-1 text-xs hover:text-accent ${
        isLiked ? "text-accent" : "text-text-muted"
      }`}
    >
      <Heart size={12} fill={isLiked ? "currentColor" : "none"} />
      {likesCount > 0 && likesCount}
    </button>
  );
}

export default function CommentSection({ postId, postAuthorId, autoFocus = false }) {
  const { user } = useAuth();
  const { profile } = useUserProfile(user.uid);
  const { comments, loading, addComment, deleteComment } = useComments(postId, postAuthorId);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim() || !profile) return;

    setSubmitting(true);
    try {
      await addComment({
        authorId: user.uid,
        authorUsername: profile.username,
        authorDisplayName: profile.displayName,
        authorPhotoURL: profile.photoURL,
        text: text.trim(),
      });
      setText("");
      inputRef.current?.focus();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-3 border-t border-border pt-3">
      {loading ? (
        <p className="text-sm text-text-muted">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-text-muted">No comments yet. Be the first to reply.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start justify-between gap-2">
              <div className="flex gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-xs font-semibold text-accent">
                  {comment.authorPhotoURL ? (
                    <img src={comment.authorPhotoURL} alt="" className="h-full w-full object-cover" />
                  ) : (
                    comment.authorDisplayName?.charAt(0).toUpperCase() || "?"
                  )}
                </div>
                <div>
                  <span className="text-sm font-medium text-text-primary">
                    {comment.authorDisplayName}
                  </span>{" "}
                  <span className="text-sm text-text-primary">{comment.text}</span>
                  <div className="mt-1">
                    <CommentLikeButton
                      postId={postId}
                      commentId={comment.id}
                      uid={user.uid}
                      commentAuthorId={comment.authorId}
                      likesCount={comment.likesCount ?? 0}
                    />
                  </div>
                </div>
              </div>

              {comment.authorId === user.uid && (
                <button
                  onClick={() => deleteComment(comment.id)}
                  className="text-xs text-text-muted hover:text-red-400"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={280}
          placeholder="Write a comment..."
          className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm text-text-primary outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
        >
          Reply
        </button>
      </form>
    </div>
  );
}