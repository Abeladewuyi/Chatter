import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { useFollow } from "../../hooks/useFollow";

export default function ProfileHeader({ profile, isOwnProfile, currentUid, onEditClick }) {
  const { isFollowing, toggleFollow } = useFollow(currentUid, profile.id);

  return (
    <div className="mt-2 border-b border-border pb-5 pl-3">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-xl font-semibold text-accent">
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
          <h1 className="text-xl sm:text-2xl font-semibold text-text-primary">{profile.displayName}</h1>
          <p className="text-sm sm:text-base text-text-secondary">@{profile.username}</p>
        </div>

        {isOwnProfile ? null : (
          <div className="flex gap-2">
            <button
              onClick={toggleFollow}
              className={
                isFollowing
                  ? "rounded-lg border border-border px-4 py-2 text-sm text-text-secondary hover:border-red-400 hover:text-red-400"
                  : "rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
              }
            >
              {isFollowing ? "Following" : "Follow"}
            </button>

            <Link
              to={`/messages/${profile.id}`}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-text-primary hover:border-accent"
            >
              <MessageCircle size={16} />
              Message
            </Link>
          </div>
        )}
      </div>

      {profile.bio && <p className="mt-3 text-base sm:text-lg text-text-primary">{profile.bio}</p>}

      <div className="mt-4 flex justify-center gap-14 text-xs">
        <div className="flex flex-col items-center">
          <span className="text-lg sm:text-xl font-extrabold text-text-primary">{profile.postsCount ?? 0}</span>
          <span className="text-xs text-text-secondary">Posts</span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-lg sm:text-xl font-extrabold text-text-primary">{profile.followingCount ?? 0}</span>
          <span className="text-xs text-text-secondary">Following</span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-lg sm:text-xl font-extrabold text-text-primary">{profile.followersCount ?? 0}</span>
          <span className="text-xs text-text-secondary">Followers</span>
        </div>
      </div>

      {isOwnProfile && (
        <div className="mt-4">
          <button
            onClick={onEditClick}
            className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm text-text-primary hover:border-accent"
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
}