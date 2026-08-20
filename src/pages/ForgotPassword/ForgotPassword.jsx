import { useState } from "react";
import { Link } from "react-router-dom";
import { resetPassword, getAuthErrorMessage } from "../../firebase/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8">
        <h1 className="mb-1 text-2xl font-semibold text-text-primary">Reset password</h1>
        <p className="mb-6 text-sm text-text-secondary">
          We'll email you a link to reset your password.
        </p>

        {sent ? (
          <p className="text-sm text-text-primary">
            Check your inbox for a reset link. It can take a minute to arrive.
          </p>
        ) : (
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

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 rounded-lg bg-accent px-4 py-2 font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
            >
              {submitting ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-sm text-text-secondary">
          <Link to="/login" className="text-accent hover:text-accent-hover">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}