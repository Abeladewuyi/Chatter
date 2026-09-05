import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MobileNav from "./MobileNav/MobileNav";

/**
 * Wrap any page element with this to require login:
 *   <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
 *
 * There are three possible states here, and we handle all three on purpose —
 * skipping the "loading" check is a common bug that causes a flash-redirect
 * to /login on every page refresh, even for logged-in users, because
 * Firebase hasn't confirmed the auth state yet on that first render.
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [typedText, setTypedText] = useState("");

  const hideBottomNav =
    location.pathname === "/create-post" ||
    location.pathname === "/settings" ||
    location.pathname.startsWith("/profile") ||
    location.pathname.startsWith("/messages");

  useEffect(() => {
    if (!loading) return;

    const fullText = "Gridspace";
    let index = 0;

    const timer = setInterval(() => {
      index += 1;
      setTypedText(fullText.slice(0, index));

      if (index >= fullText.length) {
        setTimeout(() => {
          setTypedText("");
          index = 0;
        }, 550);
      }
    }, 180);

    return () => clearInterval(timer);
  }, [loading]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="typing-logo-wrap" aria-live="polite" aria-label="Loading Gridspace">
          <span className="typing-logo-text">{typedText}</span>
          <span className="typing-cursor" aria-hidden="true" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      {children}
      {!hideBottomNav && <MobileNav />}
    </>
  );
}
