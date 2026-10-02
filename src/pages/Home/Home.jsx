import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useFollowingIds } from "../../hooks/useFollowingIds";
import { usePosts } from "../../hooks/usePosts";
import { useUserProfile } from "../../hooks/useUserProfile";
import PostCard from "../../components/PostCard/PostCard";
import gridspaceLogo from "../../assets/gridspace-logo.jpeg";

function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((item) => (
        <div key={item} className="border-b border-white/10 py-4">
          <div className="flex items-center gap-3">
            <div className="skeleton skeleton-circle h-10 w-10" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3.5 w-28 rounded-full" />
              <div className="skeleton h-2.5 w-24 rounded-full" />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="skeleton h-3 w-full rounded-full" />
            <div className="skeleton h-3 w-5/6 rounded-full" />
            <div className="skeleton h-3 w-2/3 rounded-full" />
          </div>

          <div className="mt-4 skeleton h-64 w-full rounded-2xl" />

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="skeleton h-5 w-10 rounded-full" />
              <div className="skeleton h-5 w-10 rounded-full" />
              <div className="skeleton h-5 w-10 rounded-full" />
            </div>
            <div className="skeleton skeleton-circle h-6 w-6" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const uid = user?.uid;

  const { profile } = useUserProfile(uid);
  const { followingIds, loading: loadingFollowing } = useFollowingIds(uid);
  const [feedFilter, setFeedFilter] = useState("For you");
  const followingOnly = feedFilter === "Following";
  const authorIds = followingOnly ? followingIds : null;
  const { posts, loading: loadingPosts, error } = usePosts(authorIds);
  const loading = loadingFollowing || loadingPosts;
  const displayName = profile?.displayName || "You";
  const username = profile?.username || "";
  const photoURL = profile?.photoURL || "";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-5 sm:px-6 lg:px-8">
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

          <div className="sticky top-0 z-20 mb-4 flex items-center justify-start bg-bg py-3">
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

          <div
            className={`transition-opacity duration-500 ease-out ${loading ? "opacity-100" : "hidden opacity-0"}`}
          >
            <FeedSkeleton />
          </div>

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

          <div
            className={`flex flex-col transition-opacity duration-500 ease-out ${loading ? "pointer-events-none opacity-0" : "opacity-100"}`}
          >
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}