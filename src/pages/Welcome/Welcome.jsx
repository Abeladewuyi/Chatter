import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, Palette, Sparkles, Users, Lightbulb, TrendingUp, ChevronRight } from "lucide-react";
import gridspaceLogo from "../../assets/gridspace-logo.png";

const SLIDES = [
  {
    key: "community",
    title: "Join a community\nthat gets you.",
    body: "Gridspace is a space for designers and developers to connect, share work, and grow together.",
    Visual: CommunityVisual,
  },
  {
    key: "share",
    title: "Post your work,\nmemes & wins.",
    body: "Drop a gist, a shipped feature, or the meme only devs will understand. Your feed, your voice.",
    Visual: ShareVisual,
  },
  {
    key: "ideas",
    title: "Turn ideas into\nreal ventures.",
    body: "Find a co-founder, a collaborator, or just someone who won't laugh at your 2am startup idea.",
    Visual: IdeasVisual,
  },
];

// Entrance animation for each element within a slide — staggers children
// in one after another rather than everything popping in at once.
const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function Welcome() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const isLast = index === SLIDES.length - 1;

  function goTo(newIndex) {
    setDirection(newIndex > index ? 1 : -1);
    setIndex(newIndex);
  }

  function handleNext() {
    if (isLast) return;
    goTo(index + 1);
  }

  function handleDragEnd(_, info) {
    const threshold = 60;
    if (info.offset.x < -threshold && !isLast) goTo(index + 1);
    else if (info.offset.x > threshold && index > 0) goTo(index - 1);
  }

  const { title, body, Visual } = SLIDES[index];

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg px-6 py-8">
      {/* Soft blurred gradient orbs behind everything — gives real depth
          instead of a flat black background, still monochrome */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/[0.06] blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-1/3 h-64 w-64 rounded-full bg-white/[0.04] blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-sm flex-1 flex-col">
        <div className="flex items-center justify-between">
          <img src={gridspaceLogo} alt="Gridspace" className="h-8 w-8" />
          {!isLast && (
            <Link to="/login" className="text-xs font-medium text-text-muted hover:text-text-primary">
              Skip
            </Link>
          )}
        </div>

        {/* AnimatePresence + drag lets slides actually swipe left/right
            like a native onboarding carousel, not just fade */}
        <div className="mt-8 flex-1">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={index}
              custom={direction}
              variants={container}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: direction * -40, transition: { duration: 0.2 } }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={handleDragEnd}
            >
              <motion.h1
                variants={item}
                className="font-display whitespace-pre-line text-3xl font-bold leading-tight text-text-primary"
              >
                {title}
              </motion.h1>
              <motion.p variants={item} className="mt-3 text-sm leading-relaxed text-text-secondary">
                {body}
              </motion.p>

              <motion.div variants={item} className="relative mt-10 h-64 w-full">
                <Visual />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex justify-center gap-1.5">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.key}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-6 bg-text-primary" : "w-1.5 bg-surface-2"
              }`}
            />
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-10">
          <AnimatePresence mode="wait">
            {!isLast ? (
              <motion.button
                key="next"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleNext}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-accent py-3.5 text-sm font-semibold text-on-accent transition-transform hover:opacity-90 active:scale-[0.98]"
              >
                Next
                <ChevronRight size={16} />
              </motion.button>
            ) : (
              <motion.div
                key="cta"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-3"
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// --- Slide 1: Community — floating profile cards, matches your reference ---
function CommunityVisual() {
  return (
    <>
      <div className="absolute left-0 top-2 w-36 -rotate-6 rounded-2xl border border-border bg-surface p-3 shadow-2xl">
        <Code2 size={16} className="text-text-muted" />
        <div className="mt-3 h-2 w-full rounded-full bg-surface-2" />
        <div className="mt-1.5 h-2 w-2/3 rounded-full bg-surface-2" />
      </div>

      <div className="animate-float absolute right-2 top-0 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-neutral-500 to-neutral-800 text-white shadow-2xl">
        <Users size={22} />
      </div>

      <div
        className="animate-float absolute left-2 top-28 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-neutral-700 to-black text-white shadow-2xl"
        style={{ animationDelay: "1.2s" }}
      >
        <Palette size={22} />
      </div>

      <div className="absolute right-0 top-24 w-40 rounded-2xl bg-white p-3 text-black shadow-2xl">
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

      <div className="absolute bottom-0 left-8 flex items-center gap-2 rounded-full border border-border bg-surface py-1.5 pl-1.5 pr-3 shadow-lg">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-neutral-600 to-neutral-900 text-xs font-semibold text-white">
          A
        </div>
        <span className="text-xs font-medium text-text-primary">alex.dev</span>
        <ChevronRight size={12} className="text-text-muted" />
      </div>
    </>
  );
}

// --- Slide 2: Share your work — a mini feed-post mockup ---
function ShareVisual() {
  return (
    <>
      <div className="animate-float absolute right-4 top-0 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-neutral-600 to-black text-white shadow-2xl">
        <Sparkles size={20} />
      </div>

      <div className="absolute left-0 top-6 w-52 rounded-2xl border border-border bg-surface p-4 shadow-2xl">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-neutral-500 to-neutral-800" />
          <div>
            <p className="text-xs font-semibold text-text-primary">mickey_can_code</p>
            <p className="text-[10px] text-text-muted">2h ago</p>
          </div>
        </div>
        <p className="mt-3 text-[11px] leading-snug text-text-secondary">
          me looking at code I wrote 1 month ago 💀
        </p>
        <div className="mt-3 flex items-center gap-3 text-text-muted">
          <span className="text-[10px]">♥ 21.5k</span>
          <span className="text-[10px]">💬 3.1k</span>
        </div>
      </div>

      <div
        className="animate-float absolute bottom-4 left-10 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 text-white shadow-xl"
        style={{ animationDelay: "0.8s" }}
      >
        <Code2 size={18} />
      </div>

      <div className="absolute bottom-0 right-2 w-36 rotate-3 rounded-2xl bg-white p-3 text-black shadow-2xl">
        <p className="text-[10px] font-semibold">5 Design Industry Shifts</p>
        <div className="mt-2 h-1.5 w-full rounded-full bg-neutral-200" />
        <div className="mt-1.5 h-1.5 w-2/3 rounded-full bg-neutral-200" />
      </div>
    </>
  );
}

// --- Slide 3: Business ideas — collaboration / pitch mockup ---
function IdeasVisual() {
  return (
    <>
      <div className="absolute left-4 top-0 w-40 rounded-2xl border border-border bg-surface p-3 shadow-2xl">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-neutral-600 to-black text-white">
            <Lightbulb size={14} />
          </div>
          <p className="text-xs font-semibold text-text-primary">Looking for a co-founder</p>
        </div>
        <p className="mt-2 text-[10px] leading-snug text-text-secondary">
          Building a dev-tools startup. Need a frontend lead.
        </p>
      </div>

      <div
        className="animate-float absolute right-0 top-16 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-neutral-500 to-neutral-900 text-white shadow-2xl"
        style={{ animationDelay: "0.5s" }}
      >
        <TrendingUp size={22} />
      </div>

      <div className="absolute bottom-6 left-0 w-44 rounded-2xl bg-white p-3 text-black shadow-2xl">
        <p className="text-[10px] font-semibold text-neutral-500">MATCHED</p>
        <div className="mt-1 flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-neutral-400 to-neutral-700" />
          <p className="text-xs font-semibold">You + jules.designs</p>
        </div>
      </div>

      <div
        className="animate-float absolute bottom-0 right-6 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface text-text-primary shadow-lg"
        style={{ animationDelay: "1.4s" }}
      >
        <Sparkles size={18} />
      </div>
    </>
  );
}