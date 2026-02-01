"use client";

import { motion } from "framer-motion";

export function TranscribingShimmer() {
  return (
    <motion.div
      className="flex h-full w-full items-center justify-center rounded-xl border border-input bg-background px-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <motion.span
        animate={{ backgroundPosition: "0% center" }}
        className="inline-block bg-[length:250%_100%,auto] bg-clip-text text-sm text-transparent"
        style={{
          backgroundImage:
            "linear-gradient(90deg, transparent calc(50% - 30px), hsl(var(--foreground)), transparent calc(50% + 30px)), linear-gradient(hsl(var(--muted-foreground)), hsl(var(--muted-foreground)))",
          backgroundRepeat: "no-repeat, padding-box",
        }}
        initial={{ backgroundPosition: "100% center" }}
        transition={{
          repeat: Infinity,
          duration: 2,
          ease: "linear",
        }}
      >
        Transcribing audio...
      </motion.span>
    </motion.div>
  );
}