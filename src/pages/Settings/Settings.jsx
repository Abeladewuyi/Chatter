import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Lock, Shield, Bell, LifeBuoy, AlertCircle } from "lucide-react";
import { updateEmail } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { useUserProfile } from "../../hooks/useUserProfile";
import { db } from "../../firebase/config";
import { logOut } from "../../firebase/auth";

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useUserProfile(user.uid);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [contactInfoOpen, setContactInfoOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(user.email || "");
  const [contactError, setContactError] = useState("");
  const [savingContactInfo, setSavingContactInfo] = useState(false);

  useEffect(() => {
    setUsername(profile?.username || "");
  }, [profile?.username]);

  useEffect(() => {
    setEmail(user.email || "");
  }, [user.email]);

  async function handleContactInfoSubmit(event) {
    event.preventDefault();

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(trimmedUsername)) {
      setContactError("Username must be 3–20 letters, numbers, or underscores.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setContactError("Enter a valid email address.");
      return;
    }

    setContactError("");
    setSavingContactInfo(true);

    try {
      if (trimmedEmail !== user.email) {
        await updateEmail(user, trimmedEmail);
      }

      await updateDoc(doc(db, "users", user.uid), {
        username: trimmedUsername,
      });
      setContactInfoOpen(false);
    } catch (error) {
      if (error.code === "auth/requires-recent-login") {
        setContactError("Sign in again before changing your email address.");
      } else if (error.code === "auth/email-already-in-use") {
        setContactError("That email address is already in use.");
      } else {
        setContactError("Couldn't save contact info. Please try again.");
      }
    } finally {
      setSavingContactInfo(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <header className="relative mb-4 h-12">
        <div className="absolute inset-y-0 left-0 flex items-center">
          <button aria-label="Back" onClick={() => navigate(-1)} className="p-2 text-text-secondary hover:text-text-primary">
            <ArrowLeft size={22} />
          </button>
        </div>

        <h2 className="absolute inset-x-0 top-0 text-center text-lg font-semibold text-text-primary">Settings</h2>
      </header>

      <section className="mb-6">
        <h3 className="mb-3 text-lg font-semibold text-text-primary">Account Center</h3>
        <div className="flex flex-col divide-y divide-border overflow-hidden rounded-lg bg-surface ring-1 ring-white/10">
          <button
            className="flex items-center justify-between gap-4 px-4 py-3 text-left"
            onClick={() => setContactInfoOpen((open) => !open)}
            aria-expanded={contactInfoOpen}
          >
            <div className="flex items-center gap-3">
              <User size={18} className="text-text-secondary" />
              <div className="text-lg text-text-primary">Edit contact info</div>
            </div>
            <div className="text-text-secondary">›</div>
          </button>

          {contactInfoOpen && (
            <form onSubmit={handleContactInfoSubmit} className="flex flex-col gap-4 bg-bg/60 p-4">
              <div>
                <label htmlFor="contact-username" className="mb-1 block text-sm text-text-secondary">
                  Username
                </label>
                <input
                  id="contact-username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  maxLength={20}
                  className="w-full rounded-lg bg-surface-2 px-3 py-2 text-text-primary outline-none ring-1 ring-white/10 focus:ring-white/30"
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="mb-1 block text-sm text-text-secondary">
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-lg bg-surface-2 px-3 py-2 text-text-primary outline-none ring-1 ring-white/10 focus:ring-white/30"
                />
              </div>

              {contactError && <p className="text-sm text-red-400">{contactError}</p>}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={savingContactInfo}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-on-accent hover:bg-accent-hover disabled:opacity-60"
                >
                  {savingContactInfo ? "Saving..." : "Save contact info"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUsername(profile?.username || "");
                    setEmail(user.email || "");
                    setContactError("");
                    setContactInfoOpen(false);
                  }}
                  disabled={savingContactInfo}
                  className="rounded-lg bg-surface-2 px-4 py-2 text-sm text-text-secondary hover:text-text-primary disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <button className="flex items-center justify-between gap-4 px-4 py-3 text-left" onClick={() => navigate('/change-password')}>
            <div className="flex items-center gap-3">
              <Lock size={18} className="text-text-secondary" />
              <div className="text-lg text-text-primary">Change Password</div>
            </div>
            <div className="text-text-secondary">›</div>
          </button>

          <button className="flex items-center justify-between gap-4 px-4 py-3 text-left" onClick={() => navigate('/privacy')}>
            <div className="flex items-center gap-3">
              <Shield size={18} className="text-text-secondary" />
              <div className="text-lg text-text-primary">Privacy</div>
            </div>
            <div className="text-text-secondary">›</div>
          </button>
        </div>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold text-text-primary mb-3">Preferences</h3>
        <div className="flex items-center justify-between px-4 py-3 rounded-md bg-bg/50">
          <div className="flex items-center gap-3">
            <Bell size={18} className="text-text-secondary" />
            <div className="text-lg text-text-primary">Push Notifications</div>
          </div>

          <button
            onClick={() => setPushEnabled((s) => !s)}
            className={`w-12 h-6 rounded-full p-0.5 ${pushEnabled ? 'bg-accent' : 'bg-surface'}`}
            aria-pressed={pushEnabled}
          >
            <span className={`block w-5 h-5 rounded-full bg-white transform transition ${pushEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold text-text-primary mb-3">Support</h3>
        <div className="flex flex-col divide-y divide-border rounded-md overflow-hidden bg-bg/50">
          <button className="flex items-center justify-between gap-4 px-4 py-3 text-left" onClick={() => navigate('/help') }>
            <div className="flex items-center gap-3">
              <LifeBuoy size={18} className="text-text-secondary" />
              <div className="text-lg text-text-primary">Help Center</div>
            </div>
            <div className="text-text-secondary">›</div>
          </button>

          <button className="flex items-center justify-between gap-4 px-4 py-3 text-left" onClick={() => navigate('/report') }>
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="text-text-secondary" />
              <div className="text-lg text-text-primary">Report a Problem</div>
            </div>
            <div className="text-text-secondary">›</div>
          </button>
        </div>
      </section>

      <div className="mt-8">
        <button onClick={logOut} className="w-full rounded-lg bg-red-500 px-4 py-3 text-base font-medium text-white hover:bg-red-600">
          Log out
        </button>
      </div>
    </div>
  );
}
