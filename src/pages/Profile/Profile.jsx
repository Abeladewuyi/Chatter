import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useUserProfile } from "../../hooks/useUserProfile";
import ProfileHeader from "../../components/ProfileHeader/ProfileHeader";
import EditProfileForm from "../../components/ProfileHeader/EditProfileForm";

export default function Profile() {
  const { user } = useAuth();
  const { profile, loading, error } = useUserProfile(user.uid);
  const [isEditing, setIsEditing] = useState(false);

  if (loading) {
    return <div className="p-6 text-text-secondary">Loading profile...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-400">Couldn't load your profile. Please refresh.</div>;
  }

  if (!profile) {
    return <div className="p-6 text-text-secondary">No profile found for this account.</div>;
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      {isEditing ? (
        <EditProfileForm uid={user.uid} profile={profile} onDone={() => setIsEditing(false)} />
      ) : (
        <ProfileHeader
          profile={profile}
          isOwnProfile={true}
          onEditClick={() => setIsEditing(true)}
        />
      )}

      <div className="mt-6 text-sm text-text-muted">
        Posts will show up here starting in Stage 3.
      </div>
    </div>
  );
}