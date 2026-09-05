import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home as HomeIcon, MessageCircle, Plus, Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useNotifications } from "../../hooks/useNotifications";
import { useUnreadMessageCount } from "../../hooks/useUnreadMessageCount";

function NotificationBadge({ count }) {
  if (count === 0) return null;
  return (
    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
      {count > 9 ? "9+" : count}
    </span>
  );
}

// Figures out which of the 5 tabs corresponds to the current URL — using
// startsWith for messages/profile since those also have sub-routes like
// /messages/:uid and /profile/:uid that should still count as "active".
function getActiveIndex(pathname) {
  if (pathname === "/") return 0;
  if (pathname.startsWith("/messages")) return 1;
  if (pathname === "/create-post") return 2;
  if (pathname.startsWith("/notifications")) return 3;
  if (pathname.startsWith("/profile")) return 4;
  return -1;
}

export default function MobileNav() {
  const { user } = useAuth();
  const { profile } = useUserProfile(user?.uid);
  const { unreadCount } = useNotifications(user?.uid);
  const { unreadMessageCount } = useUnreadMessageCount(user?.uid);
  const location = useLocation();

  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const [indicatorLeft, setIndicatorLeft] = useState(null);

  const activeIndex = getActiveIndex(location.pathname);

  // Measures the actual pixel position of the active icon every time the
  // route changes, so the indicator slides to wherever that icon really
  // sits — rather than guessing based on fixed spacing (which would break
  // the moment icon sizes or gaps change).
  useEffect(() => {
    const activeEl = itemRefs.current[activeIndex];
    const containerEl = containerRef.current;
    if (activeEl && containerEl) {
      const itemRect = activeEl.getBoundingClientRect();
      const containerRect = containerEl.getBoundingClientRect();
      setIndicatorLeft(itemRect.left + itemRect.width / 2 - containerRect.left);
    } else {
      setIndicatorLeft(null);
    }
  }, [activeIndex]);

  const photoURL = profile?.photoURL || "";
  const initial = (profile?.displayName || "?").charAt(0).toUpperCase();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-5 lg:hidden">
      <div
        ref={containerRef}
        className="relative flex items-center gap-8 rounded-full border-2 border-neutral-700 bg-black px-8 py-3.5 shadow-lg"
      >
        {/* The sliding "you are here" circle — hidden until we've measured
            a real position, so it doesn't flash in the wrong spot on load */}
        {indicatorLeft !== null && (
          <span
            className="absolute top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-700 transition-all duration-300 ease-out"
            style={{ left: indicatorLeft }}
          />
        )}

        <Link
          to="/"
          ref={(el) => (itemRefs.current[0] = el)}
          className={`relative z-10 flex items-center justify-center ${
            activeIndex === 0 ? "text-text-primary" : "text-text-muted"
          }`}
        >
          <HomeIcon size={22} />
        </Link>

        <Link
          to="/messages"
          ref={(el) => (itemRefs.current[1] = el)}
          className={`relative z-10 flex items-center justify-center ${
            activeIndex === 1 ? "text-text-primary" : "text-text-muted"
          }`}
        >
          <MessageCircle size={22} />
          <NotificationBadge count={unreadMessageCount} />
        </Link>

        <Link
          to="/create-post"
          ref={(el) => (itemRefs.current[2] = el)}
          aria-label="Create post"
          className="relative z-10 flex items-center justify-center text-text-primary"
        >
          <Plus size={22} />
        </Link>

        <Link
          to="/notifications"
          ref={(el) => (itemRefs.current[3] = el)}
          className={`relative z-10 flex items-center justify-center ${
            activeIndex === 3 ? "text-text-primary" : "text-text-muted"
          }`}
        >
          <Bell size={22} />
          <NotificationBadge count={unreadCount} />
        </Link>

        <Link
          to="/profile"
          ref={(el) => (itemRefs.current[4] = el)}
          className="relative z-10 flex items-center justify-center"
        >
          <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-surface text-[10px] font-semibold text-text-primary">
            {photoURL ? (
              <img src={photoURL} alt="" className="h-full w-full object-cover" />
            ) : (
              initial
            )}
          </div>
        </Link>
      </div>
    </nav>
  );
}