import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { useFollow } from "../../hooks/useFollow";

export default function ProfileHeader({ profile, isOwnProfile, currentUid, onEditClick }) {
  const { isFollowing, toggleFollow } = useFollow(currentUid, profile.id);

  return (
    <div className="border-b border-border pb-6 mt-2 pl-4">
      <div className="flex items-center gap-6">
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-2xl font-semibold text-accent">
          {profile.photoURL ? (
            <img
              src={profile.photoURL}
              alt={profile.displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            profile.displayName?.charAt(0).toUpperCase() || "?"
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary">{profile.displayName}</h1>
          <p className="text-base sm:text-lg text-text-secondary">@{profile.username}</p>
        </div>

        {isOwnProfile ? null : (
          <div className="flex gap-2">
            <button
              onClick={toggleFollow}
              className={
                isFollowing
                  ? "rounded-lg border border-border px-5 py-3 text-base text-text-secondary hover:border-red-400 hover:text-red-400"
                  : "rounded-lg bg-accent px-5 py-3 text-base font-medium text-white hover:bg-accent-hover"
              }
            >
              {isFollowing ? "Following" : "Follow"}
            </button>

            <Link
              to={`/messages/${profile.id}`}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-3 text-base text-text-primary hover:border-accent"
            >
              <MessageCircle size={18} />
              Message
            </Link>
          </div>
        )}
      </div>

      {profile.bio && <p className="mt-4 text-lg sm:text-xl text-text-primary">{profile.bio}</p>}

      <div className="mt-4 flex justify-center gap-20 text-sm">
        <div className="flex flex-col items-center">
          <span className="text-xl sm:text-2xl font-extrabold text-text-primary">{profile.postsCount ?? 0}</span>
          <span className="text-sm text-text-secondary">Posts</span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-xl sm:text-2xl font-extrabold text-text-primary">{profile.followingCount ?? 0}</span>
          <span className="text-sm text-text-secondary">Following</span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-xl sm:text-2xl font-extrabold text-text-primary">{profile.followersCount ?? 0}</span>
          <span className="text-sm text-text-secondary">Followers</span>
        </div>
      </div>

      {isOwnProfile && (
        <div className="mt-4">
          <button
            onClick={onEditClick}
            className="w-full rounded-lg border border-border bg-surface-2 px-4 py-3 text-base text-text-primary hover:border-accent"
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
}