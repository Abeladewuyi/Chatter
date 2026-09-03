import { Bell, House, Search, Plus, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../hooks/useNotifications";

const navItems = [
  { to: "/", label: "Home", icon: House },
  { to: "/explore", label: "Search", icon: Search },
  { to: "/create-post", label: "New", icon: Plus },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/profile", label: "Profile", icon: User },
];

function Badge({ count, color = "bg-accent" }) {
  if (count === 0) return null;

  return (
    <span
      className={`absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full ${color} px-1 text-[10px] font-semibold text-white`}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}

export default function MobileNav() {
  const location = useLocation();
  const { user } = useAuth();
  const { unreadCount } = useNotifications(user?.uid);
  const isChatView = location.pathname.startsWith("/messages/") && location.pathname !== "/messages";

  if (isChatView) {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-0 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <div className="mx-auto grid h-18 w-full max-w-full grid-cols-5">
        {navItems.map(({ to, label, icon: Icon }) => {
          const badgeCount = to === "/notifications" ? unreadCount : 0;
          const badgeColor = "bg-accent";

          return (
            <NavLink
              key={label}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `relative flex w-full flex-col items-center justify-center gap-0 transition-colors ${
                  isActive ? "text-accent" : "text-text-muted hover:text-text-primary"
                }`
              }
            >
              <span className="relative flex items-center justify-center">
                <Icon size={26} strokeWidth={2} />
                <Badge count={badgeCount} color={badgeColor} />
              </span>
              <span className="text-[11px] font-semibold mt-1">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}