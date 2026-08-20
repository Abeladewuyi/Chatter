import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logIn, getAuthErrorMessage } from "../../firebase/auth";
import chatterLogo from "../../assets/chatter-logo.png";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in both fields.");
      return;
    }

    setSubmitting(true);
    try {
      await logIn({ email, password });
      navigate("/"); // AuthContext will pick up the new user automatically
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
<div className="min-h-screen bg-surface px-6 py-8 sm:flex sm:items-center sm:justify-center sm:bg-bg sm:px-4">
  <div className="w-full max-w-sm sm:rounded-2xl sm:border sm:border-border sm:bg-surface sm:p-8">

  <img
  src={chatterLogo}
  alt="Chatter"
  className="h-8 w-auto"
/>



<div className="mt-16 sm:mt-0">
  <h1 className="mb-1 text-2xl font-semibold text-text-primary">
    Welcome back
  </h1>

  <p className="mb-6 text-sm text-text-secondary">
    Log in to continue to Chatter.
  </p>

  {/* Keep the form and the links here */}
</div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm text-text-secondary">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-text-primary outline-none focus:border-accent"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm text-text-secondary">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-text-primary outline-none focus:border-accent"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-lg bg-accent px-4 py-2 font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
          >
            {submitting ? "Logging in..." : "Log in"}
          </button>
        </form>

        <div className="mt-4 flex justify-between text-sm">
          <Link to="/forgot-password" className="text-text-secondary hover:text-accent">
            Forgot password?
          </Link>
          <Link to="/signup" className="text-accent hover:text-accent-hover">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
