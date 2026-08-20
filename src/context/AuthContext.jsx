import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";

const AuthContext = createContext(null);

/**
 * Wraps the whole app. Firebase's onAuthStateChanged listener fires once on load
 * (with whoever is already logged in, or null) and again every time someone logs
 * in or out — so this is the single source of truth for "who is using the app
 * right now." Every page/component reads from here instead of each one
 * separately asking Firebase Auth.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until we know the initial auth state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    // Cleanup: stop listening when the app unmounts (mostly relevant in dev/hot-reload).
    return unsubscribe;
  }, []);

  const value = { user, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Convenience hook so components can just write:
 *   const { user, loading } = useAuth();
 * instead of importing useContext + AuthContext everywhere.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}
