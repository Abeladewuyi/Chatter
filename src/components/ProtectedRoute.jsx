import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MobileNav from "./MobileNav/MobileNav";
import SplashScreen from "./SplashScreen/SplashScreen";

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

  const hideBottomNav =
    location.pathname === "/create-post" ||
    location.pathname === "/settings" ||
    location.pathname.startsWith("/profile") ||
    location.pathname.startsWith("/messages");

  if (loading) {
    return <SplashScreen />;
  }

  if (!user) {
    return <Navigate to="/welcome" replace />;
  }

  return (
    <>
      {children}
      {!hideBottomNav && <MobileNav />}
    </>
  );
}