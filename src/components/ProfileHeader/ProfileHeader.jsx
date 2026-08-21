import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { useFollow } from "../../hooks/useFollow";

export default function ProfileHeader({ profile, isOwnProfile, currentUid, onEditClick }) {
  const { isFollowing, toggleFollow } = useFollow(currentUid, profile.id);

  return (
    <div className="border-b border-border pb-6">
      <div className="flex items-center gap-4">
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
          <h1 className="text-xl font-semibold text-text-primary">{profile.displayName}</h1>
          <p className="text-sm text-text-secondary">@{profile.username}</p>
        </div>

        {isOwnProfile ? (
          <button
            onClick={onEditClick}
            className="rounded-lg border border-border bg-surface-2 px-4 py-2 text-sm text-text-primary hover:border-accent"
          >
            Edit Profile
          </button>
        ) : (
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
              className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm text-text-primary hover:border-accent"
            >
              <MessageCircle size={16} />
              Message
            </Link>
          </div>
        )}
      </div>

      {profile.bio && <p className="mt-4 text-sm text-text-primary">{profile.bio}</p>}

      <div className="mt-4 flex gap-6 text-sm">
        <span>
          <span className="font-semibold text-text-primary">{profile.postsCount ?? 0}</span>{" "}
          <span className="text-text-secondary">Posts</span>
        </span>
        <span>
          <span className="font-semibold text-text-primary">{profile.followingCount ?? 0}</span>{" "}
          <span className="text-text-secondary">Following</span>
        </span>
        <span>
          <span className="font-semibold text-text-primary">{profile.followersCount ?? 0}</span>{" "}
          <span className="text-text-secondary">Followers</span>
        </span>
      </div>
    </div>
  );
}