import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { signUp, getAuthErrorMessage } from "../../firebase/auth";
import gridspaceLogo from "../../assets/gridspace-logo.jpeg";

const STEPS = [
  {
    field: "displayName",
    label: "What's your name?",
    placeholder: "Mike Nelson",
    type: "text",
    validate: (value) => (!value.trim() ? "Please enter your name." : ""),
  },
  {
    field: "username",
    label: "Choose a username",
    placeholder: "mike_nelson",
    type: "text",
    validate: (value) =>
      !/^[a-zA-Z0-9_]{3,20}$/.test(value)
        ? "3–20 characters: letters, numbers, or underscores."
        : "",
  },
  {
    field: "email",
    label: "What's your email?",
    placeholder: "you@example.com",
    type: "email",
    validate: (value) => (!value.includes("@") ? "Please enter a valid email." : ""),
  },
  {
    field: "password",
    label: "Create a password",
    placeholder: "At least 6 characters",
    type: "password",
    validate: (value) => (value.length < 6 ? "Password must be at least 6 characters." : ""),
  },
];

export default function Signup() {
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState({ displayName: "", username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayDone, setOverlayDone] = useState(false);
  const [progressPct, setProgressPct] = useState(0);

  const step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;
  const value = form[step.field];

  function updateValue(newValue) {
    setForm((prev) => ({ ...prev, [step.field]: newValue }));
  }

  async function handleNext(e) {
    e.preventDefault();

    const validationError = step.validate(value);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");

    if (!isLastStep) {
      setStepIndex((i) => i + 1);
      return;
    }

    setSubmitting(true);
    try {
      await signUp(form);
      // show completion overlay, then navigate after animation
      setShowOverlay(true);
      setSubmitting(false);
      // navigate once animation and check visible
      setTimeout(() => navigate("/"), 2200);
    } catch (err) {
      setError(getAuthErrorMessage(err));
      setSubmitting(false);
    }
  }

  function handleBack() {
    setError("");
    if (stepIndex === 0) {
      navigate("/login");
    } else {
      setStepIndex((i) => i - 1);
    }
  }

  useEffect(() => {
    if (!showOverlay) return;
    setProgressPct(0);
    let rafId;
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const pct = Math.floor(t * 100);
      setProgressPct(pct);
      if (t < 1) rafId = requestAnimationFrame(tick);
      else {
        setProgressPct(100);
        setOverlayDone(true);
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [showOverlay]);

  return (
    <div className="flex min-h-screen items-start justify-center bg-shiny shiny-sheen relative px-4 pt-24">
      <div className="w-full max-w-sm">
        <button
          onClick={handleBack}
          aria-label="Go back"
          className="fixed top-6 left-4 z-50 inline-flex items-center justify-center rounded-lg bg-white/60 text-text-primary shadow-sm border border-border border-opacity-30 px-3 py-2 transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
        >
          <svg
            width="28"
            height="20"
            viewBox="0 0 28 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M18.5 2.5L8 10L18.5 17.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="19.5" y="9" width="6" height="2" rx="1" fill="currentColor" />
          </svg>
        </button>

        <div className="mt-0 mb-4 flex flex-col items-center text-center">
          <img src={gridspaceLogo} alt="Gridspace" className="mb-2 h-10 w-10" />

          <div className="mb-4 flex gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-6 rounded-full ${
                  i <= stepIndex ? "bg-accent" : "bg-surface-2"
                }`}
              />
            ))}
          </div>

          <h1 className="text-3xl font-semibold text-text-primary">{step.label}</h1>
        </div>

        <form onSubmit={handleNext} className="flex flex-col gap-4">
          <input
            autoFocus
            type={step.type}
            value={value}
            onChange={(e) => updateValue(e.target.value)}
            placeholder={step.placeholder}
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-text-primary outline-none focus:border-accent"
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-lg bg-accent px-4 py-2.5 font-medium text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-60"
          >
            {submitting ? "Creating account..." : isLastStep ? "Create Account" : "Next"}
          </button>
        </form>

        <p className="mt-10 text-center text-sm text-text-secondary hidden lg:block">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-text-primary underline-offset-4 transition-opacity hover:underline active:opacity-60"
          >
            Log in
          </Link>
        </p>

        {/* Mobile fixed bottom login prompt */}
        <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4 lg:hidden">
          <p className="rounded-lg bg-bg/80 px-4 py-2 text-center text-sm text-text-secondary backdrop-blur">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-text-primary underline-offset-4">
              Log in
            </Link>
          </p>
        </div>
      </div>

      {showOverlay && (
        <div className={`signup-overlay ${overlayDone ? "done" : ""}`}>
          <div className="panel">
            <svg className="progress-ring" viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r="45" />
              <circle
                className="progress"
                cx="50"
                cy="50"
                r="45"
                style={{ strokeDashoffset: 282.6 * (1 - progressPct / 100) }}
              />
              <text x="50" y="56" textAnchor="middle">{progressPct}%</text>
            </svg>

            <div className="check">
              <div className="icon" aria-hidden>
                {overlayDone && (
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </div>

            <div className="message">{overlayDone ? "Completed" : "Creating account..."}</div>
          </div>
        </div>
      )}
    </div>
  );
}