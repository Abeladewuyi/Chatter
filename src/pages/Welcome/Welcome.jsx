import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, Palette, Sparkles, Users, Lightbulb, TrendingUp, ChevronRight } from "lucide-react";
import gridspaceLogo from "../../assets/gridspace-logo.jpeg";
import femaleDesigner from "../../assets/Femaledesigner.png";
import maleProgrammer from "../../assets/maleprogrammer.png";
import figmaDesign from "../../assets/figmadesign.jpg";
import techIndustry from "../../assets/tech-industry.jpg";
import techCommunity from "../../assets/tech-community.jpg";

const SLIDES = [
  {
    key: "community",
    title: "Join a community\nthat gets you.",
    body: "Gridspace is a space for designers and developers to connect, share work, and grow together.",
    Visual: CommunityVisual,
  },
  {
    key: "discover",
    title: "Discover what's\nnext in tech.",
    body: "Explore ideas, projects, communities, and conversations from people building the future.",
    Visual: DiscoverVisual,
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
// --- Slide 1: Community — programmer + designer ---
function CommunityVisual() {
  return (
    <div className="relative h-full w-full">

      {/* Soft background glow */}
      <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />

      {/* =========================
          PROGRAMMER CODE CARD
         ========================= */}
      <motion.div
        initial={{ opacity: 0, y: 20, rotate: -4 }}
        animate={{ opacity: 1, y: 0, rotate: -4 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="absolute left-0 top-5 z-10 w-[210px] overflow-hidden rounded-2xl border border-white/10 bg-[#111116] shadow-2xl"
      >
        {/* Editor header */}
        <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2.5">
          <span className="h-2 w-2 rounded-full bg-red-400/70" />
          <span className="h-2 w-2 rounded-full bg-yellow-400/70" />
          <span className="h-2 w-2 rounded-full bg-green-400/70" />

          <span className="ml-auto text-[8px] text-white/30">
            app.jsx
          </span>
        </div>

        {/* Code */}
        <div className="px-3 py-3 font-mono text-[8px] leading-[1.8]">
          <div>
            <span className="text-purple-400">const</span>{" "}
            <span className="text-blue-300">Profile</span>{" "}
            <span className="text-white/50">=</span>{" "}
            <span className="text-purple-400">()</span>{" "}
            <span className="text-white/50">=&gt;</span>
          </div>

          <div className="pl-3">
            <span className="text-white/50">return</span>{" "}
            <span className="text-white/70">(</span>
          </div>

          <div className="pl-6">
            <span className="text-blue-300">&lt;div</span>{" "}
            <span className="text-purple-300">className</span>
            <span className="text-white/50">=</span>
            <span className="text-green-300">"profile"</span>
            <span className="text-blue-300">&gt;</span>
          </div>

          <div className="pl-9">
            <span className="text-blue-300">&lt;h2&gt;</span>
            <span className="text-white/80">Build. Share. Grow.</span>
            <span className="text-blue-300">&lt;/h2&gt;</span>
          </div>

          <div className="pl-9">
            <span className="text-blue-300">&lt;p&gt;</span>
            <span className="text-white/50">
              {" "}
              Connect with creators.
            </span>
            <span className="text-blue-300">&lt;/p&gt;</span>
          </div>

          <div className="pl-6">
            <span className="text-blue-300">&lt;/div&gt;</span>
          </div>

          <div className="pl-3">
            <span className="text-white/50">);</span>
          </div>

          <div>
            <span className="text-white/50">{"}"}</span>
          </div>
        </div>
      </motion.div>

      {/* Programmer floating profile */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: -15 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="absolute -left-1 bottom-5 z-30 flex items-center gap-2 rounded-full border border-white/10 bg-[#18181d]/95 py-1.5 pl-1.5 pr-3 shadow-xl backdrop-blur-md"
      >
        <img
          src={maleProgrammer}
          alt="Programmer"
          className="h-8 w-8 rounded-full object-cover ring-2 ring-accent/30"
        />

        <div>
          <p className="text-[10px] font-semibold text-text-primary">
            Alex Carter
          </p>
          <p className="text-[8px] text-text-muted">
            Programmer
          </p>
        </div>

        <div className="ml-1 h-1.5 w-1.5 rounded-full bg-green-400" />
      </motion.div>

      {/* =========================
          DESIGNER / FIGMA CARD
         ========================= */}
      <motion.div
        initial={{ opacity: 0, y: 25, rotate: 5 }}
        animate={{ opacity: 1, y: 0, rotate: 5 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="absolute right-0 top-16 z-20 w-[175px] overflow-hidden rounded-2xl border border-white/20 bg-white p-1.5 shadow-2xl"
      >
        <img
          src={figmaDesign}
          alt="Designer interface"
          className="h-[128px] w-full rounded-xl object-cover"
        />

        <div className="flex items-center gap-2 px-1.5 py-2">
          <div className="h-6 w-6 rounded-lg bg-[#f4f4f5] p-1.5">
            <Palette size={12} className="text-black" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[9px] font-semibold text-black">
              Mobile App Design
            </p>
            <p className="text-[8px] text-neutral-500">
              Figma · Prototype
            </p>
          </div>
        </div>
      </motion.div>

      {/* Designer floating profile */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: 15 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.65 }}
        className="absolute right-0 bottom-3 z-30 flex items-center gap-2 rounded-full border border-white/10 bg-white/95 py-1.5 pl-1.5 pr-3 shadow-xl"
      >
        <img
          src={femaleDesigner}
          alt="Designer"
          className="h-8 w-8 rounded-full object-cover"
        />

        <div>
          <p className="text-[10px] font-semibold text-black">
            Maya Williams
          </p>
          <p className="text-[8px] text-neutral-500">
            UI/UX Designer
          </p>
        </div>

        <div className="ml-1 h-1.5 w-1.5 rounded-full bg-green-400" />
      </motion.div>

      {/* Small connection indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.9 }}
        className="absolute left-1/2 top-1/2 z-40 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-accent shadow-lg shadow-accent/30"
      >
        <Users size={17} className="text-on-accent" />
      </motion.div>

    </div>
  );
}
// --- Slide 2: Share your work — a mini feed-post mockup ---
// --- Slide 2: Discover Tech ---
function DiscoverVisual() {
  return (
    <div className="relative h-full w-full">

      {/* Background glow */}
      <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/15 blur-3xl" />

      {/* Main technology image */}
      <motion.div
        initial={{ opacity: 0, y: 25, rotate: -3 }}
        animate={{ opacity: 1, y: 0, rotate: -3 }}
        transition={{ duration: 0.6 }}
        className="absolute left-1/2 top-2 z-10 w-[255px] -translate-x-1/2 overflow-hidden rounded-3xl border border-white/15 bg-[#15151b] p-1.5 shadow-2xl"
      >
        <div className="relative overflow-hidden rounded-[20px]">
          <img
            src={techIndustry}
            alt="Technology and innovation"
            className="h-[185px] w-full object-cover"
          />

          {/* Dark gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          {/* Image label */}
          <div className="absolute bottom-3 left-3">
            <div className="mb-1 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              <span className="text-[8px] font-medium text-white/80">
                TRENDING NOW
              </span>
            </div>

            <p className="text-sm font-bold text-white">
              The future is tech
            </p>
          </div>
        </div>

        {/* Bottom information */}
        <div className="flex items-center justify-between px-2.5 py-2.5">
          <div>
            <p className="text-[9px] font-semibold text-white">
              Technology & Innovation
            </p>
            <p className="text-[8px] text-white/40">
              24.8K people discussing
            </p>
          </div>

          <div className="flex -space-x-1.5">
            <div className="h-5 w-5 rounded-full border-2 border-[#15151b] bg-purple-400" />
            <div className="h-5 w-5 rounded-full border-2 border-[#15151b] bg-blue-400" />
            <div className="h-5 w-5 rounded-full border-2 border-[#15151b] bg-pink-400" />
          </div>
        </div>
      </motion.div>

      {/* Tech community card */}
      <motion.div
        initial={{ opacity: 0, x: -25, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.55, delay: 0.25 }}
        className="absolute -left-1 bottom-8 z-20 w-[150px] overflow-hidden rounded-2xl border border-white/15 bg-[#17171d] shadow-xl"
      >
        <img
          src={techCommunity}
          alt="Developers collaborating"
          className="h-[82px] w-full object-cover"
        />

        <div className="p-2.5">
          <div className="mb-1 flex items-center gap-1">
            <Code2 size={10} className="text-accent" />
            <span className="text-[8px] font-semibold text-white/90">
              DEV COMMUNITY
            </span>
          </div>

          <p className="text-[9px] font-medium text-white">
            Build together
          </p>

          <p className="mt-0.5 text-[7px] text-white/40">
            8.2K active members
          </p>
        </div>
      </motion.div>

      {/* Trending topics */}
      <motion.div
        initial={{ opacity: 0, x: 25, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.55, delay: 0.4 }}
        className="absolute -right-1 bottom-12 z-20 w-[125px] rounded-2xl border border-white/15 bg-[#17171d]/95 p-3 shadow-xl backdrop-blur-md"
      >
        <div className="mb-2 flex items-center gap-1.5">
          <TrendingUp size={11} className="text-accent" />

          <span className="text-[9px] font-semibold text-white">
            Trending
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[8px] text-white/60">
              #AI
            </span>
            <span className="text-[7px] text-white/30">
              12.4K
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[8px] text-white/60">
              #WebDev
            </span>
            <span className="text-[7px] text-white/30">
              8.7K
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[8px] text-white/60">
              #React
            </span>
            <span className="text-[7px] text-white/30">
              6.3K
            </span>
          </div>
        </div>
      </motion.div>

      {/* Floating Explore badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="absolute right-4 top-0 z-30 flex items-center gap-1.5 rounded-full border border-white/15 bg-accent px-3 py-1.5 shadow-lg shadow-accent/20"
      >
        <Sparkles size={10} className="text-on-accent" />
        <span className="text-[8px] font-bold text-on-accent">
          EXPLORE
        </span>
      </motion.div>

    </div>
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