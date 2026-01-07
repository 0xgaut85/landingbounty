"use client";

import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Preload audio on mount
  useEffect(() => {
    audioRef.current = new Audio("/stroke1.mp3");
    audioRef.current.preload = "auto";
    audioRef.current.load();
  }, []);

  const handleUnlock = () => {
    if (isUnlocked) return;
    
    // Play sound immediately
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
    
    setIsUnlocked(true);
    
    // Focus input after unlock
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-neutral-200 bg-white/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {!isUnlocked ? (
          <motion.button
            onClick={handleUnlock}
            className="flex-1 px-4 py-3 bg-neutral-100 rounded-xl text-sm text-neutral-500 cursor-pointer relative overflow-hidden"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            style={{ filter: "blur(1px)" }}
          >
            <span className="relative z-10">unlock</span>
          </motion.button>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Ask anything..."
            className="flex-1 px-4 py-3 bg-neutral-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-neutral-300 transition-all placeholder:text-neutral-400 disabled:opacity-50"
          />
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={disabled || !input.trim() || !isUnlocked}
          className="p-3 bg-foreground text-background rounded-xl disabled:opacity-30 transition-opacity"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
          </svg>
        </motion.button>
      </div>
    </div>
  );
}
