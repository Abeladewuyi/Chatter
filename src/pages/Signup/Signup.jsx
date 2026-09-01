import { useState } from "react";
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
      navigate("/");
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
<button
  onClick={handleBack}
  className="mb-10 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:border-text-primary hover:text-text-primary active:bg-surface-2"
>
  <ArrowLeft size={14} />
  Back
</button>

        <div className="mb-8 flex flex-col items-center text-center">
          <img src={gridspaceLogo} alt="Gridspace" className="mb-4 h-10 w-10" />

          <div className="mb-6 flex gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-6 rounded-full ${
                  i <= stepIndex ? "bg-accent" : "bg-surface-2"
                }`}
              />
            ))}
          </div>

          <h1 className="text-2xl font-semibold text-text-primary">{step.label}</h1>
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

<p className="mt-10 text-center text-sm text-text-secondary">
  Already have an account?{" "}
  <Link
    to="/login"
    className="font-medium text-text-primary underline-offset-4 transition-opacity hover:underline active:opacity-60"
  >
    Log in
  </Link>
</p>
      </div>
    </div>
  );
}