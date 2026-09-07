import { Link } from "react-router-dom";
import { Code2, Palette, Sparkles, ChevronRight } from "lucide-react";
import gridspaceLogo from "../../assets/gridspace-logo.jpeg";

export default function Welcome() {
  return (
    <div className="flex min-h-screen flex-col bg-bg px-6 py-8">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col">
        <img
          src={gridspaceLogo}
          alt="Gridspace"
          className="h-8 w-8 animate-fade-up"
          style={{ animationDelay: "0ms" }}
        />

        <div className="mt-10 animate-fade-up" style={{ animationDelay: "80ms" }}>
          <h1 className="font-display text-3xl font-bold leading-tight text-text-primary">
            Join a community
            <br />
            that gets you.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            Gridspace is a space for designers and developers to connect, share
            work, and grow together.
          </p>
        </div>

        {/* Decorative floating collage — placeholder avatars/icons stand in
            for real community photos until you add some to src/assets */}
        <div className="relative mt-10 h-64 w-full">
          <div
            className="absolute left-0 top-2 w-36 -rotate-6 rounded-2xl border border-border bg-surface p-3 shadow-xl animate-fade-up"
            style={{ animationDelay: "160ms" }}
          >
            <Code2 size={16} className="text-text-muted" />
            <div className="mt-3 h-2 w-full rounded-full bg-surface-2" />
            <div className="mt-1.5 h-2 w-2/3 rounded-full bg-surface-2" />
          </div>

          <div
            className="absolute right-2 top-0 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-neutral-500 to-neutral-800 text-white shadow-xl animate-float animate-fade-up"
            style={{ animationDelay: "240ms" }}
          >
            <Sparkles size={22} />
          </div>

          <div
            className="absolute left-2 top-28 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-neutral-700 to-black text-white shadow-xl animate-float animate-fade-up"
            style={{ animationDelay: "320ms", animationDirection: "reverse" }}
          >
            <Palette size={22} />
          </div>

          <div
            className="absolute right-0 top-24 w-40 rounded-2xl bg-white p-3 text-black shadow-xl animate-fade-up"
            style={{ animationDelay: "400ms" }}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-black text-white">
                <Palette size={14} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold">Concept Design</p>
                <p className="text-[10px] text-neutral-500">Sade · just now</p>
              </div>
            </div>
          </div>

          <div
            className="absolute bottom-0 left-8 flex items-center gap-2 rounded-full border border-border bg-surface py-1.5 pl-1.5 pr-3 shadow-lg animate-fade-up"
            style={{ animationDelay: "480ms" }}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-neutral-600 to-neutral-900 text-xs font-semibold text-white">
              A
            </div>
            <span className="text-xs font-medium text-text-primary">alex.dev</span>
            <ChevronRight size={12} className="text-text-muted" />
          </div>
        </div>

        {/* Decorative pagination dots */}
        <div
          className="mt-6 flex justify-center gap-1.5 animate-fade-up"
          style={{ animationDelay: "560ms" }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-text-primary" />
          <span className="h-1.5 w-1.5 rounded-full bg-surface-2" />
          <span className="h-1.5 w-1.5 rounded-full bg-surface-2" />
        </div>

        <div
          className="mt-auto flex flex-col gap-3 pt-10 animate-fade-up"
          style={{ animationDelay: "640ms" }}
        >
          <Link
            to="/signup"
            className="rounded-xl bg-accent py-3.5 text-center text-sm font-semibold text-on-accent transition-transform hover:opacity-90 active:scale-[0.98]"
          >
            Create Account
          </Link>
          <Link
            to="/login"
            className="py-2 text-center text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            Log in instead
          </Link>
        </div>
      </div>
    </div>
  );
}