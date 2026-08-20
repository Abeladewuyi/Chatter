import { Bell, House, MessageCircle, Search } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home", icon: House },
  { to: "/explore", label: "Explore", icon: Search },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/messages", label: "Messages", icon: MessageCircle },
];

export default function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <div className="mx-auto grid h-16 max-w-lg grid-cols-4">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={label}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 text-xs transition-colors ${
                isActive
                  ? "text-accent"
                  : "text-text-muted hover:text-text-primary"
              }`
            }
          >
            <Icon size={21} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}