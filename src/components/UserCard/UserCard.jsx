import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useFollow } from "../../hooks/useFollow";

export default function UserCard({ profile }) {
  const { user } = useAuth();
  const { isFollowing, toggleFollow } = useFollow(user.uid, profile.id);

  const isSelf = profile.id === user.uid;

  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-3">
      <Link to={`/profile/${profile.id}`} className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-sm font-semibold text-accent">
          {profile.photoURL ? (
            <img src={profile.photoURL} alt="" className="h-full w-full object-cover" />
          ) : (
            profile.displayName?.charAt(0).toUpperCase() || "?"
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">{profile.displayName}</p>
          <p className="text-xs text-text-muted">@{profile.username}</p>
        </div>
      </Link>

      {!isSelf && (
        <button
          onClick={toggleFollow}
          className={
            isFollowing
              ? "rounded-lg border border-border px-3 py-1.5 text-xs text-text-secondary hover:border-red-400 hover:text-red-400"
              : "rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover"
          }
        >
          {isFollowing ? "Following" : "Follow"}
        </button>
      )}
    </div>
  );
}