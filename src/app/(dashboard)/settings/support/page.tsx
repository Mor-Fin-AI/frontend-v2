"use client";

import { motion, type Variants } from "framer-motion";
import SupportTicketSection from "../components/SupportTicketSection";

const variants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function SettingsSupportPage() {
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-7"
    >
      <SupportTicketSection />
    </motion.div>
  );
}
