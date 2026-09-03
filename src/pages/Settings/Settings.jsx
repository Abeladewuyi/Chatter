import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Lock, Shield, Bell, LifeBuoy, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { logOut } from "../../firebase/auth";

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pushEnabled, setPushEnabled] = useState(true);

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
        <h3 className="text-lg font-semibold text-text-primary mb-3">Account</h3>
        <div className="flex flex-col divide-y divide-border rounded-md overflow-hidden bg-bg/50">
          <button className="flex items-center justify-between gap-4 px-4 py-3 text-left" onClick={() => navigate('/profile') }>
            <div className="flex items-center gap-3">
              <User size={18} className="text-text-secondary" />
              <div>
                <div className="text-lg text-text-primary">{user.displayName || user.email}</div>
                <div className="text-sm text-text-secondary font-light">Edit Profile</div>
              </div>
            </div>
            <div className="text-text-secondary">›</div>
          </button>

          <button className="flex items-center justify-between gap-4 px-4 py-3 text-left" onClick={() => navigate('/change-password')}>
            <div className="flex items-center gap-3">
              <Lock size={18} className="text-text-secondary" />
              <div>
                <div className="text-lg text-text-primary">Change Password</div>
                <div className="text-sm text-text-secondary font-light">Update your password</div>
              </div>
            </div>
            <div className="text-text-secondary">›</div>
          </button>

          <button className="flex items-center justify-between gap-4 px-4 py-3 text-left" onClick={() => navigate('/privacy')}>
            <div className="flex items-center gap-3">
              <Shield size={18} className="text-text-secondary" />
              <div>
                <div className="text-lg text-text-primary">Privacy</div>
                <div className="text-sm text-text-secondary font-light">Privacy settings</div>
              </div>
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
            <div>
              <div className="text-lg text-text-primary">Push Notifications</div>
              <div className="text-sm text-text-secondary font-light">Receive push notifications</div>
            </div>
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
              <div>
                <div className="text-lg text-text-primary">Help Center</div>
                <div className="text-sm text-text-secondary font-light">Get help and guides</div>
              </div>
            </div>
            <div className="text-text-secondary">›</div>
          </button>

          <button className="flex items-center justify-between gap-4 px-4 py-3 text-left" onClick={() => navigate('/report') }>
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="text-text-secondary" />
              <div>
                <div className="text-lg text-text-primary">Report a Problem</div>
                <div className="text-sm text-text-secondary font-light">Send feedback or report bugs</div>
              </div>
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
