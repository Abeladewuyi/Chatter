import { useEffect, useRef, useState } from "react";
import { Heart, MessageCircle, Send } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useComments } from "../../hooks/useComments";
import { useCommentLike } from "../../hooks/useCommentLike";
import { useRepost } from "../../hooks/useRepost";

function animateIcon(event, keyframes) {
  event.currentTarget.querySelector("svg")?.animate(keyframes, {
    duration: 360,
    easing: "ease-out",
  });
}

function CommentActions({ postId, comment, uid, onReply }) {
  const { isLiked, toggleLike } = useCommentLike(postId, comment.id, uid, comment.authorId);
  const { isReposted, toggleRepost } = useRepost(
    ["posts", postId, "comments", comment.id],
    uid,
    ["posts", postId, "comments", comment.id]
  );
  return (
    <div className="flex items-center gap-5">
      <button
        onClick={(event) => {
          animateIcon(event, [
            { transform: "scale(1)" },
            { transform: "scale(1.22)" },
            { transform: "scale(1)" },
          ]);
          toggleLike();
        }}
        className={`flex items-center gap-1 text-sm hover:text-accent ${
          isLiked ? "text-red-500" : "text-text-muted"
        }`}
      >
        <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
        {comment.likesCount ?? 0}
      </button>
      <button
        onClick={(event) => {
          animateIcon(event, [
            { transform: "translateY(0)" },
            { transform: "translateY(-3px)" },
            { transform: "translateY(0)" },
          ]);
          onReply(comment);
        }}
        className="flex items-center gap-1 text-sm text-text-muted hover:text-accent"
        aria-label="Reply to comment"
      >
        <MessageCircle size={24} />
      </button>
      <button
        onClick={(event) => {
          animateIcon(event, [
            { transform: "rotate(0deg)" },
            { transform: "rotate(-12deg)" },
            { transform: "rotate(0deg)" },
          ]);
          toggleRepost();
        }}
        className={`flex items-center gap-1 text-sm text-text-muted hover:text-accent ${isReposted ? "text-accent" : ""}`}
        aria-pressed={isReposted}
      >
        <Send size={24} />
        {comment.repostsCount ?? 0}
      </button>
    </div>
  );
}

function CommentItem({ comment, repliesByParent, postId, uid, onReply, onDelete }) {
  const navigate = useNavigate();

  return (
    <>
      <div
        className={`relative flex cursor-pointer items-start justify-between gap-2 py-4 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-white/10 after:content-[''] last:after:hidden ${
          comment.parentCommentId ? "ml-8" : ""
        }`}
        onClick={() => navigate(`/post/${postId}`)}
      >
        <div className="flex min-w-0 gap-2">
          <Link
            to={`/profile/${comment.authorId}`}
            onClick={(event) => event.stopPropagation()}
            aria-label={`View ${comment.authorDisplayName}'s profile`}
            className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-xs font-semibold text-accent"
          >
            {comment.authorPhotoURL ? (
              <img src={comment.authorPhotoURL} alt="" className="h-full w-full object-cover" />
            ) : (
              comment.authorDisplayName?.charAt(0).toUpperCase() || "?"
            )}
          </Link>
          <div className="min-w-0">
            <Link
              to={`/profile/${comment.authorId}`}
              onClick={(event) => event.stopPropagation()}
              className="mb-1 block w-fit text-base font-medium text-text-primary hover:underline"
            >
              {comment.authorDisplayName}
            </Link>
            <p className="whitespace-pre-wrap break-words text-base text-text-primary">
              {comment.text}
            </p>
            <div className="mt-1" onClick={(event) => event.stopPropagation()}>
              <CommentActions
                postId={postId}
                comment={comment}
                uid={uid}
                onReply={onReply}
              />
            </div>
          </div>
        </div>

        {comment.authorId === uid && (
          <button
            onClick={(event) => {
              event.stopPropagation();
              onDelete(comment.id);
            }}
            className="text-xs text-text-muted hover:text-red-400"
          >
            Delete
          </button>
        )}
      </div>
      {(repliesByParent[comment.id] || []).map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          repliesByParent={repliesByParent}
          postId={postId}
          uid={uid}
          onReply={onReply}
          onDelete={onDelete}
        />
      ))}
    </>
  );
}

export default function CommentSection({ postId, postAuthorId, autoFocus = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profile } = useUserProfile(user.uid);
  const { comments, loading, addComment, deleteComment } = useComments(postId, postAuthorId);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const inputRef = useRef(null);

  const repliesByParent = comments.reduce((replies, comment) => {
    if (comment.parentCommentId) {
      replies[comment.parentCommentId] ??= [];
      replies[comment.parentCommentId].push(comment);
    }
    return replies;
  }, {});
  const topLevelComments = comments.filter((comment) => !comment.parentCommentId);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  function handleReply(comment) {
    setReplyingTo(comment);
    inputRef.current?.focus();
  }

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
        parentCommentId: replyingTo?.id || null,
        parentAuthorId: replyingTo?.authorId || null,
      });
      setText("");
      setReplyingTo(null);
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
        <div className="flex flex-col">
          {topLevelComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              repliesByParent={repliesByParent}
              postId={postId}
              uid={user.uid}
              onReply={handleReply}
              onDelete={deleteComment}
            />
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-3">
        {replyingTo && (
          <div className="mb-2 flex items-center gap-2 text-xs text-text-muted">
            <span>Replying to {replyingTo.authorDisplayName}</span>
            <button
              type="button"
              onClick={() => {
                setReplyingTo(null);
                setText("");
              }}
              className="text-text-secondary hover:text-text-primary"
            >
              Cancel
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={280}
            placeholder={replyingTo ? `Reply to ${replyingTo.authorDisplayName}...` : "Write a comment..."}
            className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm text-text-primary outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
          >
            Reply
          </button>
        </div>
      </form>
    </div>
  );
}