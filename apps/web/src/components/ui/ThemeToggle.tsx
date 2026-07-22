"use client";

import { motion } from "framer-motion";
import { BsFillCloudyFill, BsStarFill } from "react-icons/bs";
import clsx from "clsx";
import { useTheme } from "@/context/ThemeContext";
import type { AppThemeMode } from "@/lib/fluentTheme";

type DarkModeToggleProps = {
  mode: AppThemeMode;
  onToggle: () => void;
  className?: string;
};

function SunCenter() {
  return <div className="absolute inset-1 rounded-full bg-amber-300" />;
}

function MoonSpots() {
  return (
    <>
      <motion.div
        initial={{ x: -2, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.35 }}
        className="absolute bottom-0.5 right-1.5 h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-300"
      />
      <motion.div
        initial={{ x: -2, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.35 }}
        className="absolute bottom-2 left-0.5 h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-300"
      />
      <motion.div
        initial={{ x: -2, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.35 }}
        className="absolute right-1 top-0.5 h-1 w-1 rounded-full bg-slate-400 dark:bg-slate-300"
      />
    </>
  );
}

function Thumb({ mode }: { mode: AppThemeMode }) {
  const isDark = mode === "dark";

  return (
    <motion.div
      layout
      transition={{
        duration: 0.75,
        type: "spring",
      }}
      className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full shadow-md"
    >
      <div
        className={clsx(
          "absolute inset-0 transition-colors duration-500",
          isDark
            ? "bg-slate-200"
            : "animate-pulse rounded-full bg-gradient-to-tr from-amber-300 to-yellow-500"
        )}
      />
      {!isDark && <SunCenter />}
      {isDark && <MoonSpots />}
    </motion.div>
  );
}

function Stars() {
  return (
    <>
      <motion.span
        animate={{
          scale: [0.75, 1, 0.75],
          opacity: [0.75, 1, 0.75],
        }}
        transition={{
          repeat: Infinity,
          duration: 5,
          ease: "easeIn",
        }}
        className="absolute right-5 top-0.5 text-[6px] text-violet-200"
      >
        <BsStarFill />
      </motion.span>
      <motion.span
        animate={{
          scale: [1, 0.75, 1],
          opacity: [0.5, 0.25, 0.5],
        }}
        transition={{
          repeat: Infinity,
          duration: 3.5,
          ease: "easeIn",
        }}
        style={{ rotate: "-45deg" }}
        className="absolute right-2 top-1 text-[8px] text-violet-200"
      >
        <BsStarFill />
      </motion.span>
      <motion.span
        animate={{
          scale: [1, 0.5, 1],
          opacity: [1, 0.5, 1],
        }}
        style={{ rotate: "45deg" }}
        transition={{
          repeat: Infinity,
          duration: 2.5,
          ease: "easeIn",
        }}
        className="absolute right-4 top-3.5 text-[7px] text-violet-200"
      >
        <BsStarFill />
      </motion.span>
    </>
  );
}

function Clouds() {
  return (
    <>
      <motion.span
        animate={{ x: [-10, -5, 0], opacity: [0, 1, 0] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          delay: 0.25,
        }}
        className="absolute left-5 top-0.5 text-[6px] text-white/90"
      >
        <BsFillCloudyFill />
      </motion.span>
      <motion.span
        animate={{ x: [-6, 0, 6], opacity: [0, 1, 0] }}
        transition={{
          duration: 14,
          repeat: Infinity,
          delay: 0.5,
        }}
        className="absolute left-2 top-2 text-[8px] text-white/90"
      >
        <BsFillCloudyFill />
      </motion.span>
      <motion.span
        animate={{ x: [-5, 0, 5], opacity: [0, 1, 0] }}
        transition={{
          duration: 12,
          repeat: Infinity,
          delay: 0.75,
        }}
        className="absolute left-6 top-3.5 text-[7px] text-white/90"
      >
        <BsFillCloudyFill />
      </motion.span>
    </>
  );
}

function DarkModeToggle({ mode, onToggle, className }: DarkModeToggleProps) {
  const isLight = mode === "light";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
      aria-pressed={mode === "dark"}
      className={clsx(
        "relative flex h-7 w-14 shrink-0 rounded-full p-0.5 shadow-md transition-colors duration-500",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        isLight
          ? "justify-end bg-gradient-to-b from-sky-400 to-[#6366f1]"
          : "justify-start bg-gradient-to-b from-[#1e1b2e] to-[#4c1d95]",
        className
      )}
    >
      <Thumb mode={mode} />
      {isLight && <Clouds />}
      {mode === "dark" && <Stars />}
    </button>
  );
}

export default function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <DarkModeToggle mode={theme} onToggle={toggleTheme} className={className} />
  );
}
