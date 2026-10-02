import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import gridspaceLogo from "./assets/gridspace-logo.jpeg";

import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import Home from "./pages/Home/Home";
import Profile from "./pages/Profile/Profile";
import Settings from "./pages/Settings/Settings";
import CreatePost from "./pages/CreatePost/CreatePost";
import Explore from "./pages/Explore/Explore";
import Notifications from "./pages/Notifications/Notifications";
import Messages from "./pages/Messages/Messages";
import NewMessage from "./pages/Messages/NewMessage";
import ChangePassword from "./pages/ChangePassword/ChangePassword";
import Privacy from "./pages/Privacy/Privacy";
import Help from "./pages/Help/Help";
import Report from "./pages/Report/Report";
import Welcome from "./pages/Welcome/Welcome";
import Post from "./pages/Post/Post";

function App() {
  const [pullDistance, setPullDistance] = useState(0);
  const startYRef = useRef(null);
  const pullDistanceRef = useRef(0);

  useEffect(() => {
    const handleTouchStart = (event) => {
      if (window.scrollY > 0 || !event.touches || event.touches.length !== 1) {
        startYRef.current = null;
        return;
      }

      startYRef.current = event.touches[0].clientY;
      pullDistanceRef.current = 0;
      setPullDistance(0);
    };

    const handleTouchMove = (event) => {
      if (startYRef.current === null || !event.touches || event.touches.length !== 1) {
        return;
      }

      const currentY = event.touches[0].clientY;
      const delta = currentY - startYRef.current;

      if (delta <= 0 || window.scrollY > 0) {
        return;
      }

      const nextDistance = Math.min(delta * 0.7, 150);
      pullDistanceRef.current = nextDistance;
      setPullDistance(nextDistance);

      if (nextDistance > 10) {
        event.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      const shouldReload = pullDistanceRef.current > 100;
      pullDistanceRef.current = 0;
      setPullDistance(0);
      startYRef.current = null;

      if (shouldReload) {
        window.location.reload();
      }
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });
    document.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, []);

  return (
    <>
      <div
        className="pull-refresh-indicator"
        style={{
          opacity: pullDistance > 0 ? 1 : 0,
          transform: `translate(-50%, ${Math.max(0, pullDistance - 8)}px)`,
        }}
      >
        <img
          src={gridspaceLogo}
          alt="Gridspace logo"
          className="pull-refresh-logo"
          style={{
            transform: `scale(${1 + Math.min(pullDistance / 220, 0.25)})`,
            opacity: pullDistance > 0 ? 1 : 0,
          }}
        />
      </div>

      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/post/:postId"
                element={
                  <ProtectedRoute>
                    <Post />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/:uid"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/create-post"
                element={
                  <ProtectedRoute>
                    <CreatePost />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/explore"
                element={
                  <ProtectedRoute>
                    <Explore />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages/:uid"
                element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages/new"
                element={
                  <ProtectedRoute>
                    <NewMessage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/change-password"
                element={
                  <ProtectedRoute>
                    <ChangePassword />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/privacy"
                element={
                  <ProtectedRoute>
                    <Privacy />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/help"
                element={
                  <ProtectedRoute>
                    <Help />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/report"
                element={
                  <ProtectedRoute>
                    <Report />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </>
  );
}

export default App;