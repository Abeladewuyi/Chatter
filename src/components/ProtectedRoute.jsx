import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MobileNav from "./MobileNav";

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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg text-text-secondary">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
  <>
    {children}
    <MobileNav />
  </>
);
}
