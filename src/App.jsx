import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import Home from "./pages/Home/Home";
import Profile from "./pages/Profile/Profile";
import CreatePost from "./pages/CreatePost/CreatePost";
import Explore from "./pages/Explore/Explore";
import Notifications from "./pages/Notifications/Notifications";
import Messages from "./pages/Messages/Messages";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
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
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;