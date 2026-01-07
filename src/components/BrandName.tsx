"use client";

import { motion } from "framer-motion";

const letters = "bounty".split("");

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const letterVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      damping: 12,
      stiffness: 200,
    },
  },
};

export default function BrandName() {
  return (
    <motion.span
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="text-2xl font-semibold tracking-tight text-foreground flex"
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          variants={letterVariants}
          className="inline-block"
        >
          {letter}
        </motion.span>
      ))}
    </motion.span>
  );
}
