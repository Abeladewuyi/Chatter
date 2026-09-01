import { Link } from "react-router-dom";
import { LogOut, Plus, Bell, Mail, Search, Home as HomeIcon, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { logOut } from "../../firebase/auth";
import { useFollowingIds } from "../../hooks/useFollowingIds";
import { usePosts } from "../../hooks/usePosts";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useNotifications } from "../../hooks/useNotifications";
import { useUnreadMessageCount } from "../../hooks/useUnreadMessageCount";
import PostCard from "../../components/PostCard/PostCard";
import gridspaceLogo from "../../assets/gridspace-logo.jpeg";

function NotificationBadge({ count, color = "bg-accent" }) {
  if (count === 0) return null;
  return (
    <span
      className={`absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full ${color} px-1 text-[10px] font-semibold text-white`}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}

export default function Home() {
  const { user } = useAuth();
  const uid = user?.uid;

  const { profile } = useUserProfile(uid);
  const { followingIds, loading: loadingFollowing } = useFollowingIds(uid);
  const authorIds = uid ? [...new Set([uid, ...followingIds])] : [];
 const { posts, loading: loadingPosts, error } = usePosts(authorIds);
  const loading = loadingFollowing || loadingPosts;
  const { unreadCount } = useNotifications(uid);
  const { unreadMessageCount } = useUnreadMessageCount(uid);

  const displayName = profile?.displayName || "You";
  const username = profile?.username || "";
  const photoURL = profile?.photoURL || "";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-5 sm:px-6 lg:px-8">
        {/* Desktop sidebar — only visible at lg breakpoint and up */}
        <aside className="sticky top-5 hidden h-[calc(100vh-2.5rem)] w-56 shrink-0 flex-col lg:flex">
          <img src={gridspaceLogo} alt="Gridspace" className="h-8 w-auto" />

          <nav className="mt-10 flex flex-col gap-2">
            <Link
              to="/"
              className="rounded-xl bg-surface-2 px-4 py-3 text-sm font-medium text-accent"
            >
              Home
            </Link>

            <Link
              to="/explore"
              className="rounded-xl px-4 py-3 text-sm font-medium text-text-secondary hover:bg-surface hover:text-text-primary"
            >
              Explore
            </Link>

            <Link
              to="/notifications"
              className="relative flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-text-secondary hover:bg-surface hover:text-text-primary"
            >
              <span className="relative">
                <Bell size={16} />
                <NotificationBadge count={unreadCount} />
              </span>
              Notifications
            </Link>

            <Link
              to="/messages"
              className="relative flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-text-secondary hover:bg-surface hover:text-text-primary"
            >
              <span className="relative">
                <Mail size={16} />
                <NotificationBadge count={unreadMessageCount} color="bg-red-500" />
              </span>
              Messages
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
            <Link to="/profile" className="flex items-center gap-3 rounded-xl p-3 hover:bg-surface">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-sm font-semibold text-accent">
                {photoURL ? (
                  <img src={photoURL} alt="" className="h-full w-full object-cover" />
                ) : (
                  initial
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text-primary">{displayName}</p>
                <p className="truncate text-xs text-text-muted">@{username}</p>
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
        <main className="min-w-0 w-full max-w-2xl pb-24 lg:pb-0">
          {/* Mobile header */}
          <header className="mb-8 flex items-center justify-between pr-14 lg:hidden">
            <img src={gridspaceLogo} alt="Gridspace" className="h-8 w-auto" />

            <div className="flex items-center gap-3">
              <Link
                to="/explore"
                className="flex h-10 w-10 items-center justify-center rounded-full text-text-secondary transition hover:bg-surface hover:text-accent"
                aria-label="Explore"
              >
                <Search size={20} />
              </Link>
            </div>
          </header>

          <div className="mb-5">
            <h1 className="text-2xl font-semibold text-text-primary">Home</h1>
            <p className="mt-1 text-sm text-text-secondary">Catch up with your community.</p>
          </div>

          {/* Post composer shortcut */}
          <Link
            to="/create-post"
            className="mb-5 block rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-accent"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-sm font-semibold text-accent">
                {photoURL ? (
                  <img src={photoURL} alt="" className="h-full w-full object-cover" />
                ) : (
                  initial
                )}
              </div>

              <div className="flex flex-1 items-center justify-between rounded-xl bg-surface-2 px-4 py-3">
                <span className="text-sm text-text-muted">What's on your mind?</span>
                <Plus size={18} className="text-accent" />
              </div>
            </div>
          </Link>

{loading && <p className="py-8 text-center text-sm text-text-secondary">Loading feed...</p>}

{error && posts.length === 0 && (
  <p className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-400">
    Couldn't load posts. Please refresh.
  </p>
)}

{!loading && posts.length === 0 && followingIds.length === 0 && (
            <div className="rounded-2xl border border-border bg-surface p-8 text-center">
              <h2 className="text-lg font-semibold text-text-primary">Your feed is empty</h2>
              <p className="mt-2 text-sm text-text-secondary">
                Follow some people to see their posts here.
              </p>

              <div className="mt-5">
                <Link
                  to="/explore"
                  className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
                >
                  Find people to follow →
                </Link>
              </div>
            </div>
          )}

          {!loading && posts.length === 0 && followingIds.length > 0 && (
            <div className="rounded-2xl border border-border bg-surface p-8 text-center">
              <p className="text-sm text-text-secondary">No posts yet from people you follow.</p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation — sits OUTSIDE the desktop sidebar so it
          actually gets to render on small screens. lg:hidden hides it once
          the desktop sidebar takes over. */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-bg/95 backdrop-blur-lg lg:hidden">
        <div className="grid h-16 grid-cols-4">
          <Link
            to="/"
            className="flex flex-col items-center justify-center gap-1 text-text-secondary hover:text-accent"
          >
            <HomeIcon size={20} />
            <span className="text-[10px] font-medium">Home</span>
          </Link>

          <Link
            to="/messages"
            className="relative flex flex-col items-center justify-center gap-1 text-text-secondary hover:text-accent"
          >
            <span className="relative">
              <Mail size={20} />
              <NotificationBadge count={unreadMessageCount} color="bg-red-500" />
            </span>
            <span className="text-[10px] font-medium">Messages</span>
          </Link>

          <Link
            to="/notifications"
            className="relative flex flex-col items-center justify-center gap-1 text-text-secondary hover:text-accent"
          >
            <span className="relative">
              <Bell size={20} />
              <NotificationBadge count={unreadCount} />
            </span>
            <span className="text-[10px] font-medium">Notifications</span>
          </Link>

          <Link
            to="/profile"
            className="flex flex-col items-center justify-center gap-1 text-text-secondary hover:text-accent"
          >
            <User size={20} />
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}