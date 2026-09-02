import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useUserProfile } from "../../hooks/useUserProfile";
import ProfileHeader from "../../components/ProfileHeader/ProfileHeader";
import EditProfileForm from "../../components/ProfileHeader/EditProfileForm";
import { ArrowLeft, Settings } from "lucide-react";
import { logOut } from "../../firebase/auth";

export default function Profile() {
  const { user } = useAuth();
  const { uid: paramUid } = useParams();
  const targetUid = paramUid || user.uid;
  const isOwnProfile = targetUid === user.uid;

  const { profile, loading, error } = useUserProfile(targetUid);
  const [isEditing, setIsEditing] = useState(false);

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

      <div className="mt-6 text-sm text-text-muted">
        Posts will show up here starting in a later update.
      </div>

      {/* Mobile-only bottom logout button */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-bg/95 px-4 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden">
        <div className="mx-auto max-w-2xl py-3">
          <button
            onClick={logOut}
            className="flex w-full items-center justify-center rounded-lg bg-red-500 px-4 py-3 text-sm font-medium text-white hover:bg-red-600"
          >
            Log out
          </button>
        </div>
      </nav>
    </div>
  );
}