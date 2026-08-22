import { Bell, House, MessageCircle, Search } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../hooks/useNotifications";
import { useUnreadMessageCount } from "../hooks/useUnreadMessageCount";

const navItems = [
  { to: "/", label: "Home", icon: House },
  { to: "/explore", label: "Explore", icon: Search },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/messages", label: "Messages", icon: MessageCircle },
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
  const { unreadMessageCount } = useUnreadMessageCount(user?.uid);
  const isChatView = location.pathname.startsWith("/messages/") && location.pathname !== "/messages";

  if (isChatView) {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <div className="mx-auto grid h-16 max-w-lg grid-cols-4">
        {navItems.map(({ to, label, icon: Icon }) => {
          const badgeCount =
            to === "/messages" ? unreadMessageCount : to === "/notifications" ? unreadCount : 0;
          const badgeColor = to === "/messages" ? "bg-red-500" : "bg-accent";

          return (
            <NavLink
              key={label}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center gap-1 text-xs transition-colors ${
                  isActive
                    ? "text-accent"
                    : "text-text-muted hover:text-text-primary"
                }`
              }
            >
              <span className="relative">
                <Icon size={21} />
                <Badge count={badgeCount} color={badgeColor} />
              </span>
              <span>{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}