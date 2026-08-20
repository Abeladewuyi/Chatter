import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUp, getAuthErrorMessage } from "../../firebase/auth";
import chatterLogo from "../../assets/chatter-logo.png";
import { ArrowLeft } from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const TOTAL_STEPS = 5;

export default function Signup() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    birthMonth: "",
    birthDay: "",
    birthYear: "",
    username: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField(field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function getDaysInSelectedMonth() {
    if (!form.birthMonth) return 31;

    return new Date(
      Number(form.birthYear) || 2000,
      Number(form.birthMonth),
      0
    ).getDate();
  }

  function validateCurrentStep() {
    if (step === 1 && !form.email.includes("@")) {
      return "Enter a valid email address.";
    }

    if (step === 2 && form.password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    if (step === 3 && (!form.firstName.trim() || !form.lastName.trim())) {
      return "Enter your first and last name.";
    }

    if (
      step === 4 &&
      (!form.birthMonth || !form.birthDay || !form.birthYear)
    ) {
      return "Select your date of birth.";
    }

    if (step === 4) {
      const birthDate = new Date(
        Number(form.birthYear),
        Number(form.birthMonth) - 1,
        Number(form.birthDay)
      );

      const minimumAgeDate = new Date();
      minimumAgeDate.setFullYear(minimumAgeDate.getFullYear() - 13);

      if (birthDate > minimumAgeDate) {
        return "You must be at least 13 years old to use Chatter.";
      }
    }

    if (step === 5 && !/^[a-zA-Z0-9_]{3,20}$/.test(form.username)) {
      return "Use 3–20 letters, numbers, or underscores.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateCurrentStep();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");

    if (step < TOTAL_STEPS) {
      setStep((currentStep) => currentStep + 1);
      return;
    }

    setSubmitting(true);

    try {
      await signUp({
        email: form.email,
        password: form.password,
        username: form.username,
        displayName: `${form.firstName.trim()} ${form.lastName.trim()}`,
      });

      navigate("/");
    } catch (firebaseError) {
      setError(getAuthErrorMessage(firebaseError));
    } finally {
      setSubmitting(false);
    }
  }

  function goBack() {
    setError("");
    setStep((currentStep) => currentStep - 1);
  }

  const years = Array.from(
    { length: new Date().getFullYear() - 1900 - 12 },
    (_, index) => new Date().getFullYear() - 13 - index
  );

  return (
    <div className="min-h-screen bg-surface px-6 py-8 sm:flex sm:items-center sm:justify-center sm:bg-bg sm:px-4">
      <div className="w-full max-w-sm sm:rounded-2xl sm:border sm:border-border sm:bg-surface sm:p-8">
        <img
          src={chatterLogo}
          alt="Chatter"
          className="h-8 w-auto"
        />
{step > 1 && (
  <button
    type="button"
    onClick={goBack}
    aria-label="Go back"
    className="mt-5 flex h-9 w-9 items-center justify-center rounded-full text-text-primary hover:bg-surface-2"
  >
    <ArrowLeft size={20} />
  </button>
)}
        <div className="mt-16 sm:mt-0">
          <p className="text-sm text-text-muted">
            Step {step} of {TOTAL_STEPS}
          </p>

          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>

          <form onSubmit={handleSubmit} className="mt-8">
            {step === 1 && (
              <>
                <h1 className="text-2xl font-semibold text-text-primary">
                  What’s your email?
                </h1>
                <p className="mt-1 text-sm text-text-secondary">
                  We’ll use it to help you sign in.
                </p>

                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="you@example.com"
                  autoFocus
                  className="mt-6 w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-text-primary outline-none focus:border-accent"
                />
              </>
            )}

            {step === 2 && (
              <>
                <h1 className="text-2xl font-semibold text-text-primary">
                  Create a password
                </h1>
                <p className="mt-1 text-sm text-text-secondary">
                  Use at least 6 characters.
                </p>

                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  placeholder="Password"
                  autoFocus
                  className="mt-6 w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-text-primary outline-none focus:border-accent"
                />
              </>
            )}

            {step === 3 && (
              <>
                <h1 className="text-2xl font-semibold text-text-primary">
                  What’s your name?
                </h1>
                <p className="mt-1 text-sm text-text-secondary">
                  This is how people will see you on Chatter.
                </p>

                <div className="mt-6 flex gap-3">
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(event) => updateField("firstName", event.target.value)}
                    placeholder="First name"
                    autoFocus
                    className="w-1/2 rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-text-primary outline-none focus:border-accent"
                  />

                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(event) => updateField("lastName", event.target.value)}
                    placeholder="Last name"
                    className="w-1/2 rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-text-primary outline-none focus:border-accent"
                  />
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <h1 className="text-2xl font-semibold text-text-primary">
                  When were you born?
                </h1>
                <p className="mt-1 text-sm text-text-secondary">
                  This stays private and helps us keep Chatter age-appropriate.
                </p>

                <div className="mt-6 grid grid-cols-3 gap-2">
                  <select
                    value={form.birthMonth}
                    onChange={(event) => updateField("birthMonth", event.target.value)}
                    className="rounded-lg border border-border bg-surface-2 px-2 py-2.5 text-sm text-text-primary outline-none focus:border-accent"
                  >
                    <option value="">Month</option>
                    {MONTHS.map((month, index) => (
                      <option key={month} value={index + 1}>
                        {month}
                      </option>
                    ))}
                  </select>

                  <select
                    value={form.birthDay}
                    onChange={(event) => updateField("birthDay", event.target.value)}
                    className="rounded-lg border border-border bg-surface-2 px-2 py-2.5 text-sm text-text-primary outline-none focus:border-accent"
                  >
                    <option value="">Day</option>
                    {Array.from(
                      { length: getDaysInSelectedMonth() },
                      (_, index) => index + 1
                    ).map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>

                  <select
                    value={form.birthYear}
                    onChange={(event) => updateField("birthYear", event.target.value)}
                    className="rounded-lg border border-border bg-surface-2 px-2 py-2.5 text-sm text-text-primary outline-none focus:border-accent"
                  >
                    <option value="">Year</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {step === 5 && (
              <>
                <h1 className="text-2xl font-semibold text-text-primary">
                  Choose a username
                </h1>
                <p className="mt-1 text-sm text-text-secondary">
                  This is how people can find you.
                </p>

                <input
                  type="text"
                  value={form.username}
                  onChange={(event) => updateField("username", event.target.value)}
                  placeholder="mike_nelson"
                  autoFocus
                  className="mt-6 w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-text-primary outline-none focus:border-accent"
                />
              </>
            )}

            {error && (
              <p className="mt-4 text-sm text-red-400">{error}</p>
            )}

            <div className="mt-8 flex gap-3">


              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-lg bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-hover disabled:opacity-60"
              >
                {submitting
                  ? "Creating account..."
                  : step === TOTAL_STEPS
                    ? "Create account"
                    : "Continue"}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-text-secondary">
            Already have an account?{" "}
            <Link to="/login" className="text-accent hover:text-accent-hover">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}