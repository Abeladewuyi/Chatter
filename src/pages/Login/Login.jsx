import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logIn, getAuthErrorMessage } from "../../firebase/auth";
import gridspaceLogo from "../../assets/gridspace-logo.jpeg";

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
      navigate("/");
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <img src={gridspaceLogo} alt="Gridspace" className="mb-4 h-12 w-12" />
          <h1 className="text-2xl font-semibold text-text-primary">Gridspace</h1>
          <p className="mt-1 text-sm text-text-secondary">Connect. Share. Grow.</p>
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
            className="mt-2 rounded-lg bg-accent px-4 py-2.5 font-medium text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-60"
          >
            {submitting ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="mt-5 flex justify-between text-sm">
          <Link to="/forgot-password" className="text-text-secondary hover:text-text-primary">
            Forgot password?
          </Link>
          <Link to="/signup" className="text-text-primary hover:text-text-secondary">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}