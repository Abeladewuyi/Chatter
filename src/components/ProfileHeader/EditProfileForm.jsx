import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

/**
 * Handles editing display name and bio. No image upload yet — that needs
 * Firebase Storage, which requires the Blaze plan. We'll add it back in
 * once that's set up; for now, avatars just show initials.
 */
export default function EditProfileForm({ uid, profile, onDone }) {
  const [displayName, setDisplayName] = useState(profile.displayName || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!displayName.trim()) {
      setError("Display name can't be empty.");
      return;
    }

    setError("");
    setSaving(true);

    try {
      await updateDoc(doc(db, "users", uid), {
        displayName: displayName.trim(),
        bio: bio.trim(),
      });
      onDone();
    } catch (err) {
      console.error(err);
      setError("Couldn't save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 border-b border-border pb-6">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-xl font-semibold text-accent">
          {displayName.charAt(0).toUpperCase() || "?"}
        </div>
        <p className="text-xs text-text-muted">
          Profile pictures coming soon — this needs a Firebase upgrade first.
        </p>
      </div>

      <div>
        <label htmlFor="displayName" className="mb-1 block text-sm text-text-secondary">
          Display name
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-text-primary outline-none focus:border-accent"
        />
      </div>

      <div>
        <label htmlFor="bio" className="mb-1 block text-sm text-text-secondary">
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={160}
          rows={3}
          className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3 py-2 text-text-primary outline-none focus:border-accent"
          placeholder="Tell people about yourself"
        />
        <p className="mt-1 text-right text-xs text-text-muted">{bio.length}/160</p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onDone}
          disabled={saving}
          className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary hover:border-accent"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}