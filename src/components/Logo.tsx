"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function Logo() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Image
        src="/logo.png"
        alt="Bounty Logo"
        width={48}
        height={48}
        priority
        className="w-12 h-12"
      />
    </motion.div>
  );
}
