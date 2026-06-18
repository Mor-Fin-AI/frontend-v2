"use client";

import { motion } from "framer-motion";
import { ArrowUpRight24Regular, Star24Filled } from "@fluentui/react-icons";
import {
  avatarVariants,
  primaryVariants,
  staggerTransition,
} from "./authMotion";

const MEMBER_AVATARS = ["AK", "JM", "RS", "LT", "DW"];
const MEMBER_COLORS = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-[var(--action-green)]",
  "bg-chart-4",
  "bg-primary",
];

export function AuthSupplementalPanel() {
  return (
    <div className="group sticky top-4 m-4 h-80 overflow-hidden rounded-3xl rounded-tl-[4rem] border border-border bg-card shadow-lg md:h-[calc(100vh-2rem)]">
      <div
        className="h-full w-full bg-cover bg-center transition-all duration-500 group-hover:scale-105 group-hover:opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(135deg, color-mix(in srgb, var(--primary) 28%, transparent) 0%, color-mix(in srgb, var(--chart-2) 22%, transparent) 38%, color-mix(in srgb, var(--card) 88%, transparent) 100%), radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--primary) 24%, transparent), transparent 48%)",
        }}
      />

      <div className="absolute right-3 top-4 z-10">
        <ArrowUpRight24Regular className="h-14 w-14 rotate-45 text-primary opacity-0 transition-all duration-500 group-hover:rotate-0 group-hover:opacity-100" />
      </div>

      <motion.div
        initial="initial"
        whileInView="animate"
        transition={staggerTransition}
        viewport={{ once: true }}
        className="absolute inset-0 flex flex-col items-start justify-end bg-gradient-to-t from-card/95 via-card/55 to-transparent p-8"
      >
        <motion.h2
          className="mb-2 text-3xl font-semibold leading-tight text-foreground lg:text-4xl"
          variants={primaryVariants}
        >
          Building Community
          <br />
          Infrastructure Together
        </motion.h2>
        <motion.p
          variants={primaryVariants}
          className="mb-6 max-w-md text-sm text-muted-foreground"
        >
          Morfinance connects learners, validators, and governance participants
          across the Do-Nou infrastructure ecosystem in Mombasa.
        </motion.p>

        <div className="flex items-center gap-4">
          <div className="flex items-center">
            {MEMBER_AVATARS.map((initials, index) => (
              <motion.span
                key={initials}
                variants={avatarVariants}
                className={`-ml-4 flex h-8 w-8 items-center justify-center rounded-full border border-border text-[10px] font-semibold text-primary-foreground shadow-sm first:ml-0 ${MEMBER_COLORS[index]}`}
              >
                {initials}
              </motion.span>
            ))}
          </div>
          <div>
            <motion.div variants={primaryVariants} className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star24Filled
                  key={index}
                  className="h-3.5 w-3.5 text-chart-4"
                />
              ))}
              <span className="ml-2 text-sm text-foreground">5.0</span>
            </motion.div>
            <motion.p variants={primaryVariants} className="text-xs text-muted-foreground">
              from community members
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
