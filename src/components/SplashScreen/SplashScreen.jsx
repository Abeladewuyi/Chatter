import { motion } from "framer-motion";
import gridspaceIcon from "../../assets/gridspace-icon-192.png";

/**
 * Shown while we're still figuring out whether someone's logged in
 * (the brief moment before Firebase Auth resolves). A plain "Loading..."
 * text here is a missed opportunity — this is the first thing anyone sees
 * on every visit, so it's worth a bit of polish.
 */
export default function SplashScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg">
      <motion.img
        src={gridspaceIcon}
        alt="Gridspace"
        className="h-16 w-16"
        initial={{ opacity: 0, scale: 0.75 }}
        animate={{
          opacity: 1,
          scale: [0.75, 1.05, 1], // pop in slightly past full size, then settle
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />

      {/* Gentle breathing pulse while we wait, so it doesn't feel frozen */}
      <motion.div
        className="mt-6 h-1 w-1 rounded-full bg-text-primary"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}