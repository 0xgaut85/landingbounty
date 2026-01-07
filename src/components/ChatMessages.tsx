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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessage]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-4 scrollbar-thin">
      {/* Render all completed messages */}
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed font-light ${
              message.role === "user"
                ? "bg-black text-white rounded-br-md"
                : "bg-white border border-neutral-400 text-black rounded-bl-md shadow-sm"
            }`}
          >
            {message.content}
          </motion.div>
        </div>
      ))}

      {/* Streaming message - no animation wrapper to avoid jump */}
      {isTyping && streamingMessage !== undefined && (
        <div className="flex justify-start">
          <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-bl-md bg-white border border-neutral-400 text-black text-sm leading-relaxed font-light shadow-sm">
            {streamingMessage}
            <span 
              className="inline-block w-0.5 h-4 bg-black ml-0.5 align-middle"
              style={{
                animation: "blink 1s step-end infinite"
              }}
            />
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />

      <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
