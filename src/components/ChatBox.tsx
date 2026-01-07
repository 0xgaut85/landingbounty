"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import ChatMessages, { Message } from "./ChatMessages";
import ChatInput from "./ChatInput";
import HalftoneOverlay from "./HalftoneOverlay";

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

// Characters that trigger longer pauses (like human thinking)
const PAUSE_CHARS = [",", ".", "!", "?", ":", ";"];

function getTypingDelay(char: string, prevChar: string): number {
  if (PAUSE_CHARS.includes(prevChar)) {
    return 150 + Math.random() * 300;
  }
  if (Math.random() < 0.05) {
    return 200 + Math.random() * 200;
  }
  if (char === " " && Math.random() < 0.3) {
    return 80 + Math.random() * 100;
  }
  return 25 + Math.random() * 75;
}

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateId(),
      role: "assistant",
      content: "gm ser. what do you want to know about Bounty?",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const charQueueRef = useRef<string[]>([]);
  const isProcessingRef = useRef(false);
  const typingSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    typingSoundRef.current = new Audio("/stroke2.mp3");
    typingSoundRef.current.preload = "auto";
    typingSoundRef.current.loop = true;
    typingSoundRef.current.load();
  }, []);

  const playTypingSound = useCallback(() => {
    if (typingSoundRef.current) {
      typingSoundRef.current.currentTime = 0;
      typingSoundRef.current.play().catch(() => {});
    }
  }, []);

  const stopTypingSound = useCallback(() => {
    if (typingSoundRef.current) {
      typingSoundRef.current.pause();
      typingSoundRef.current.currentTime = 0;
    }
  }, []);

  const processCharQueue = useCallback(() => {
    if (isProcessingRef.current || charQueueRef.current.length === 0) return;
    
    isProcessingRef.current = true;
    
    const processNext = () => {
      if (charQueueRef.current.length === 0) {
        isProcessingRef.current = false;
        return;
      }
      
      const char = charQueueRef.current.shift()!;
      setStreamingMessage((prev) => {
        const newText = prev + char;
        const prevChar = prev.length > 0 ? prev[prev.length - 1] : "";
        const delay = getTypingDelay(char, prevChar);
        
        setTimeout(processNext, delay);
        return newText;
      });
    };
    
    processNext();
  }, []);

  const handleSend = useCallback(async (content: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content,
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    setIsTyping(true);
    setStreamingMessage("");
    setStreamingId(generateId());
    charQueueRef.current = [];
    isProcessingRef.current = false;

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let fullResponse = "";
      let soundPlayed = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              const waitForQueue = () => {
                if (charQueueRef.current.length === 0 && !isProcessingRef.current) {
                  stopTypingSound();
                  setTimeout(() => {
                    const aiMessage: Message = {
                      id: streamingId || generateId(),
                      role: "assistant",
                      content: fullResponse,
                    };
                    setMessages((prev) => [...prev, aiMessage]);
                    setStreamingMessage("");
                    setStreamingId(null);
                    setIsTyping(false);
                  }, 100);
                } else {
                  setTimeout(waitForQueue, 50);
                }
              };
              waitForQueue();
            } else {
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  if (!soundPlayed) {
                    playTypingSound();
                    soundPlayed = true;
                  }
                  fullResponse += parsed.text;
                  charQueueRef.current.push(...parsed.text.split(""));
                  processCharQueue();
                }
              } catch {
                // Ignore parse errors
              }
            }
          }
        }
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        stopTypingSound();
        return;
      }
      console.error("Chat error:", error);
      stopTypingSound();
      const errorMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "The hunt was interrupted. Try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
      setStreamingMessage("");
      setStreamingId(null);
      setIsTyping(false);
    }
  }, [messages, processCharQueue, streamingId, playTypingSound, stopTypingSound]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full h-full sm:w-full sm:max-w-2xl sm:h-[75vh] bg-white sm:rounded-3xl sm:shadow-2xl sm:shadow-black/20 flex flex-col sm:border border-neutral-300"
    >
      {/* Header - includes branding on mobile */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-200 flex-shrink-0 safe-area-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <img 
              src="/logo.png" 
              alt="Bounty" 
              className="w-6 h-6 sm:w-4 sm:h-4 object-contain"
            />
            <span className="text-sm sm:text-sm font-medium text-black">Bounty Agent</span>
          </div>
          {/* X icon only on mobile */}
          <a 
            href="https://x.com/bountydotmoney" 
            target="_blank" 
            rel="noopener noreferrer"
            className="sm:hidden text-black hover:opacity-70"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>
      </div>

      {/* Messages area */}
      <div className="relative flex-1 min-h-0 flex flex-col bg-gradient-to-b from-white to-neutral-50 overflow-hidden">
        <ChatMessages 
          messages={messages} 
          isTyping={isTyping} 
          streamingMessage={streamingMessage}
          streamingId={streamingId}
        />
        
        <HalftoneOverlay />
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 safe-area-bottom">
        <ChatInput onSend={handleSend} disabled={isTyping} />
      </div>
    </motion.div>
  );
}
