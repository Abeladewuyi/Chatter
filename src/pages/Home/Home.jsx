import { useState } from "react";
import { Link } from "react-router-dom";
import { LogOut, Plus, Bell, Mail, Search, Home as HomeIcon, User, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { logOut } from "../../firebase/auth";
import { useFollowingIds } from "../../hooks/useFollowingIds";
import { usePosts } from "../../hooks/usePosts";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useNotifications } from "../../hooks/useNotifications";
import { useUnreadMessageCount } from "../../hooks/useUnreadMessageCount";
import PostCard from "../../components/PostCard/PostCard";
import gridspaceLogo from "../../assets/gridspace-logo.jpeg";
import MobileNav from "../../components/MobileNav/MobileNav";

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
  const [feedFilter, setFeedFilter] = useState("For you");

  const displayName = profile?.displayName || "You";
  const username = profile?.username || "";
  const photoURL = profile?.photoURL || "";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-5 sm:px-6 lg:px-8">
        <aside className="sticky top-5 hidden h-[calc(100vh-2.5rem)] w-56 shrink-0 flex-col lg:flex">
          <img src={gridspaceLogo} alt="Gridspace" className="h-8 w-auto" />

         <MobileNav />

          <Link
            to="/create-post"
            className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-on-accent hover:bg-accent-hover"
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

        <main className="min-w-0 w-full max-w-2xl pb-24 lg:pb-0">
          <header className="relative mb-8 flex items-center justify-center lg:hidden">
            <img src={gridspaceLogo} alt="Gridspace" className="h-12 w-auto" />

            <Link
              to="/explore"
              className="absolute right-0 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-text-secondary transition hover:bg-surface hover:text-accent"
              aria-label="Explore"
            >
              <Search size={24} />
            </Link>
          </header>

          <div className="mb-5 mt-[-4px]">
            <h1 className="text-2xl font-semibold text-text-primary">Home</h1>
            <p className="mt-1 text-sm text-text-secondary">Catch up with your community.</p>
          </div>

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

          <div className="mb-4 flex items-center justify-start">
            <div className="relative">
              <select
                value={feedFilter}
                onChange={(e) => setFeedFilter(e.target.value)}
                className="appearance-none rounded-full border border-white/10 bg-black px-4 py-2 pr-9 text-sm font-medium text-white outline-none transition hover:border-white/30 focus:border-white/40"
                aria-label="Feed filter"
              >
                <option>For you</option>
                <option>New</option>
                <option>Trending</option>
                <option>Following</option>
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
            </div>
          </div>

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
                  className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-on-accent hover:bg-accent-hover"
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

          <div className="flex flex-col">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}