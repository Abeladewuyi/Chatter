import { Link } from "react-router-dom";
import { LogOut, Plus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { logOut } from "../../firebase/auth";
import { usePosts } from "../../hooks/usePosts";
import { useUserProfile } from "../../hooks/useUserProfile";
import PostCard from "../../components/PostCard/PostCard";
import chatterLogo from "../../assets/chatter-logo.png";

export default function Home() {
  const { user } = useAuth();
  const { profile } = useUserProfile(user.uid);
  const { posts, loading, error } = usePosts();

  const displayName = profile?.displayName || "You";
  const username = profile?.username || "";
  const photoURL = profile?.photoURL || "";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-5 sm:px-6 lg:px-8">
        {/* Desktop sidebar */}
        <aside className="sticky top-5 hidden h-[calc(100vh-2.5rem)] w-56 shrink-0 flex-col lg:flex">
          <img
            src={chatterLogo}
            alt="Chatter"
            className="h-8 w-auto"
          />

          <nav className="mt-10 flex flex-col gap-2">
            <Link
              to="/"
              className="rounded-xl bg-surface-2 px-4 py-3 text-sm font-medium text-accent"
            >
              Home
            </Link>

            <Link
              to="/profile"
              className="rounded-xl px-4 py-3 text-sm font-medium text-text-secondary hover:bg-surface hover:text-text-primary"
            >
              Profile
            </Link>
          </nav>

          <Link
            to="/create-post"
            className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white hover:bg-accent-hover"
          >
            <Plus size={18} />
            Create post
          </Link>

          <div className="mt-auto border-t border-border pt-4">
            <Link
              to="/profile"
              className="flex items-center gap-3 rounded-xl p-3 hover:bg-surface"
            >
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-sm font-semibold text-accent">
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initial
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text-primary">
                  {displayName}
                </p>
                <p className="truncate text-xs text-text-muted">
                  @{username}
                </p>
              </div>
            </Link>

            <button
              onClick={logOut}
              className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-text-secondary hover:bg-surface hover:text-red-400"
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </aside>

        {/* Main feed */}
        <main className="min-w-0 w-full max-w-2xl">
          {/* Mobile header */}
          <header className="mb-8 flex items-center justify-between pr-14 lg:hidden">
            <img
              src={chatterLogo}
              alt="Chatter"
              className="h-8 w-auto"
            />

            <Link to="/profile">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-sm font-semibold text-accent">
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initial
                )}
              </div>
            </Link>
          </header>

          <div className="mb-5">
            <h1 className="text-2xl font-semibold text-text-primary">Home</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Catch up with your community.
            </p>
          </div>

          {/* Post composer shortcut */}
          <Link
            to="/create-post"
            className="mb-5 block rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-accent"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-sm font-semibold text-accent">
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initial
                )}
              </div>

              <div className="flex flex-1 items-center justify-between rounded-xl bg-surface-2 px-4 py-3">
                <span className="text-sm text-text-muted">
                  What’s on your mind?
                </span>
                <Plus size={18} className="text-accent" />
              </div>
            </div>
          </Link>

          {loading && (
            <p className="py-8 text-center text-sm text-text-secondary">
              Loading feed...
            </p>
          )}

          {error && (
            <p className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-400">
              Couldn’t load posts. Please refresh.
            </p>
          )}

          {!loading && !error && posts.length === 0 && (
            <div className="rounded-2xl border border-border bg-surface p-8 text-center">
              <h2 className="text-lg font-semibold text-text-primary">
                Your feed is quiet
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                Share the first post with your community.
              </p>

              <Link
                to="/create-post"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
              >
                <Plus size={16} />
                Create post
              </Link>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}