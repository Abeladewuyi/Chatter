import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useUserProfile } from "../../hooks/useUserProfile";
import ProfileHeader from "../../components/ProfileHeader/ProfileHeader";
import EditProfileForm from "../../components/ProfileHeader/EditProfileForm";

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
    </div>
  );
}