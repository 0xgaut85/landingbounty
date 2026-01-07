"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatMessagesProps {
  messages: Message[];
  isTyping?: boolean;
  streamingMessage?: string;
  streamingId?: string | null;
}

export default function ChatMessages({ 
  messages, 
  isTyping, 
  streamingMessage,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessage]);

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-5 py-4 sm:py-6 space-y-3 sm:space-y-4 scrollbar-thin"
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className={`max-w-[85%] sm:max-w-[80%] px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-[13px] sm:text-sm leading-relaxed font-light whitespace-pre-wrap ${
              message.role === "user"
                ? "bg-black text-white rounded-br-sm"
                : "bg-white border border-neutral-300 text-black rounded-bl-sm shadow-sm"
            }`}
          >
            {message.content}
          </motion.div>
        </div>
      ))}

      {isTyping && streamingMessage !== undefined && (
        <div className="flex justify-start">
          <div className="max-w-[85%] sm:max-w-[80%] px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl rounded-bl-sm bg-white border border-neutral-300 text-black text-[13px] sm:text-sm leading-relaxed font-light shadow-sm whitespace-pre-wrap">
            {streamingMessage}
            <span 
              className="inline-block w-0.5 h-3.5 sm:h-4 bg-black ml-0.5 align-middle"
              style={{ animation: "blink 1s step-end infinite" }}
            />
          </div>
        </div>
      )}

      <div ref={messagesEndRef} className="h-1" />

      <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
