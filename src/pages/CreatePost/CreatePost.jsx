import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useUserProfile } from "../../hooks/useUserProfile";
import { createPost } from "../../firebase/posts";
import gridspaceLogo from "../../assets/gridspace-logo.jpeg";

export default function CreatePost() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useUserProfile(user.uid);

  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const displayName = profile?.displayName || "You";
  const initial = displayName.charAt(0).toUpperCase();

  async function handleSubmit(event) {
    event.preventDefault();

    if (!text.trim()) {
      setError("Write something before posting.");
      return;
    }

    if (!profile) {
      setError("Your profile is still loading. Please try again.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await createPost({
        authorId: user.uid,
        authorUsername: profile.username,
        authorDisplayName: profile.displayName,
        authorPhotoURL: profile.photoURL,
        text: text.trim(),
      });

      navigate("/");
    } catch (firebaseError) {
      console.error(firebaseError);
      setError("Couldn’t create your post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto w-full max-w-2xl px-4 py-5 sm:px-6">
        <header className="mb-8 flex items-center justify-between pr-14">
          <img
            src={gridspaceLogo}
            alt="Gridspace"
            className="h-8 w-auto"
          />

          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft size={17} />
            Back
          </Link>
        </header>

        <div className="mb-5">
          <h1 className="text-2xl font-semibold text-text-primary">
            Create post
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Share something with your community.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-surface p-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-sm font-semibold text-accent">
              {profile?.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                initial
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-text-primary">
                {displayName}
              </p>
              <p className="text-xs text-text-muted">
                @{profile?.username || "username"}
              </p>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={500}
            rows={6}
            placeholder="What’s on your mind?"
            className="mt-5 w-full resize-none bg-transparent text-base text-text-primary outline-none placeholder:text-text-muted"
          />

          {error && (
            <p className="mt-3 text-sm text-red-400">{error}</p>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <p className="text-xs text-text-muted">
              {text.length}/500
            </p>

            <div className="flex gap-3">
              <Link
                to="/"
                className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-2"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={submitting || !text.trim()}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
              >
                {submitting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}