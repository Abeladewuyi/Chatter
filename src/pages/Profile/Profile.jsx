import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useUserProfile } from "../../hooks/useUserProfile";
import ProfileHeader from "../../components/ProfileHeader/ProfileHeader";
import EditProfileForm from "../../components/ProfileHeader/EditProfileForm";
import { ArrowLeft, Settings } from "lucide-react";
import { logOut } from "../../firebase/auth";
import { usePosts } from "../../hooks/usePosts";
import PostCard from "../../components/PostCard/PostCard";

export default function Profile() {
  const { user } = useAuth();
  const { uid: paramUid } = useParams();
  const targetUid = paramUid || user.uid;
  const isOwnProfile = targetUid === user.uid;

  const { profile, loading, error } = useUserProfile(targetUid);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");

  const { posts, loading: loadingPosts } = usePosts([profile?.id].filter(Boolean));

  if (loading) {
    return <div className="p-6 text-text-secondary">Loading profile...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-400">Couldn't load this profile. Please refresh.</div>;
  }

  if (!profile) {
    return <div className="p-6 text-text-secondary">This user doesn't exist.</div>;
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <header className="relative mb-4 h-12">
        <div className="absolute inset-y-0 left-0 flex items-center">
          <Link to="/" aria-label="Back" className="p-2 text-text-secondary hover:text-text-primary">
            <ArrowLeft size={22} />
          </Link>
        </div>

        <h2 className="absolute inset-x-0 top-0 text-center text-lg font-semibold text-text-primary">
          Profile
        </h2>

        <div className="absolute inset-y-0 right-0 flex items-center">
          <Link to="/settings" aria-label="Settings" className="p-2 text-text-secondary hover:text-text-primary">
            <Settings size={22} />
          </Link>
        </div>
      </header>
      {isEditing ? (
        <EditProfileForm uid={user.uid} profile={profile} onDone={() => setIsEditing(false)} />
      ) : (
        <ProfileHeader
          profile={profile}
          isOwnProfile={isOwnProfile}
          currentUid={user.uid}
          onEditClick={() => setIsEditing(true)}
        />
      )}

      {/* Tabs: Posts / Reposts / Saved */}
      <div className="mt-6">
        <div className="overflow-x-auto">
          <div role="tablist" className="flex w-full items-center whitespace-nowrap px-0">
            <button
              role="tab"
              aria-selected={activeTab === "posts"}
              onClick={() => setActiveTab("posts")}
              className={`flex-1 text-left px-4 py-3 text-lg font-semibold border-b-2 ${activeTab === "posts" ? "text-text-primary border-white" : "text-text-secondary border-transparent"}`}
            >
              Posts
            </button>

            <button
              role="tab"
              aria-selected={activeTab === "reposts"}
              onClick={() => setActiveTab("reposts")}
              className={`flex-1 text-center px-4 py-3 text-lg font-semibold border-b-2 ${activeTab === "reposts" ? "text-text-primary border-white" : "text-text-secondary border-transparent"}`}
            >
              Reposts
            </button>

            <button
              role="tab"
              aria-selected={activeTab === "saved"}
              onClick={() => setActiveTab("saved")}
              className={`flex-1 text-right px-4 py-3 text-lg font-semibold border-b-2 ${activeTab === "saved" ? "text-text-primary border-white" : "text-text-secondary border-transparent"}`}
            >
              Saved
            </button>
          </div>
        </div>

        <div className="mt-6">
          {activeTab === "posts" && (
            <div>
              {loadingPosts ? (
                <p className="text-center text-sm text-text-secondary">Loading posts...</p>
              ) : posts.length === 0 ? (
                <p className="text-center text-sm text-text-secondary">No posts yet.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "reposts" && (
            <div className="text-center text-sm text-text-secondary">Reposts will appear here in a future update.</div>
          )}

          {activeTab === "saved" && (
            <div className="text-center text-sm text-text-secondary">Saved posts will appear here in a future update.</div>
          )}
        </div>
      </div>

      {/* mobile logout moved to Settings page */}
    </div>
  );
}