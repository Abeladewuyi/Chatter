import { useEffect, useRef, useState } from "react";
import { Bell, Home as HomeIcon, LogOut, MessageCircle, MoreHorizontal, Search, Settings, User, UserPlus } from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { logOut } from "../../firebase/auth";
import { useNotifications } from "../../hooks/useNotifications";
import { useUnreadMessageCount } from "../../hooks/useUnreadMessageCount";
import { useUserProfile } from "../../hooks/useUserProfile";
import gridspaceLogo from "../../assets/gridspace-logo.jpeg";

function NotificationBadge({ count }) {
  if (count === 0) return null;

  return (
    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-semibold text-on-accent">
      {count > 9 ? "9+" : count}
    </span>
  );
}

const navigationItems = [
  { label: "Home", to: "/", icon: HomeIcon },
  { label: "Explore", to: "/explore", icon: Search },
  { label: "Messages", to: "/messages", icon: MessageCircle, badge: "messages" },
  { label: "Notifications", to: "/notifications", icon: Bell, badge: "notifications" },
  { label: "Profile", to: "/profile", icon: User },
  { label: "Settings", to: "/settings", icon: Settings },
];

export default function DesktopNav() {
  const { user } = useAuth();
  const { profile } = useUserProfile(user?.uid);
  const { unreadCount } = useNotifications(user?.uid);
  const { unreadMessageCount } = useUnreadMessageCount(user?.uid);
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  useEffect(() => {
    if (!accountMenuOpen) return undefined;

    function closeMenu(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    }

    function closeOnEscape(event) {
      if (event.key === "Escape") setAccountMenuOpen(false);
    }

    document.addEventListener("mousedown", closeMenu);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [accountMenuOpen]);

  const displayName = profile?.displayName || user?.displayName || "You";
  const username = profile?.username || "";
  const photoURL = profile?.photoURL || user?.photoURL || "";
  const initial = displayName.charAt(0).toUpperCase();

  async function handleLogOut() {
    setAccountMenuOpen(false);
    await logOut();
  }

  const badgeCounts = {
    messages: unreadMessageCount,
    notifications: unreadCount,
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-black px-5 py-7 lg:flex">
      <NavLink to="/" className="mb-10 px-3" aria-label="Gridspace home">
        <img src={gridspaceLogo} alt="Gridspace" className="h-9 w-auto" />
      </NavLink>

      <nav className="flex flex-col gap-2" aria-label="Primary navigation">
        {navigationItems.map(({ label, to, icon: Icon, badge }) => {
          const isActive =
            to === "/"
              ? location.pathname === "/"
              : location.pathname === to || location.pathname.startsWith(`${to}/`);

          return (
            <NavLink
              key={to}
              to={to}
              className={`flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-surface-2 text-text-primary"
                  : "text-text-secondary hover:bg-surface hover:text-text-primary"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span>{label}</span>
              {badge && <NotificationBadge count={badgeCounts[badge]} />}
            </NavLink>
          );
        })}
      </nav>

      <div ref={menuRef} className="relative mt-auto border-t border-border pt-4">
        {accountMenuOpen && (
          <div className="absolute bottom-16 left-0 right-0 overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
            <button
              type="button"
              onClick={() => {
                setAccountMenuOpen(false);
                navigate("/login");
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-text-primary hover:bg-surface-2"
            >
              <UserPlus size={17} />
              Add account
            </button>
            <button
              type="button"
              onClick={handleLogOut}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-text-primary hover:bg-surface-2"
            >
              <LogOut size={17} />
              Log out
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Link to="/profile" className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-2 hover:bg-surface">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-sm font-semibold text-accent">
              {photoURL ? <img src={photoURL} alt="" className="h-full w-full object-cover" /> : initial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-text-primary">{displayName}</p>
              <p className="truncate text-xs text-text-muted">{username ? `@${username}` : user?.email}</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setAccountMenuOpen((open) => !open)}
            className="shrink-0 rounded-lg p-2 text-text-secondary hover:bg-surface hover:text-text-primary"
            aria-label="Account options"
            aria-expanded={accountMenuOpen}
          >
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>
    </aside>
  );
}
