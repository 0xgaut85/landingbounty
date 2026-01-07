"use client";

import { useState, useCallback, useRef } from "react";
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
  // Longer pause after punctuation (human thinking)
  if (PAUSE_CHARS.includes(prevChar)) {
    return 150 + Math.random() * 300; // 150-450ms
  }
  
  // Occasional random hesitation (5% chance)
  if (Math.random() < 0.05) {
    return 200 + Math.random() * 200; // 200-400ms
  }
  
  // Space sometimes has slight pause
  if (char === " " && Math.random() < 0.3) {
    return 80 + Math.random() * 100; // 80-180ms
  }
  
  // Base typing speed with more variation
  return 25 + Math.random() * 75; // 25-100ms
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

  // Process character queue with human-like delays
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
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Add user message
    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content,
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    // Start AI typing
    setIsTyping(true);
    setStreamingMessage("");
    setStreamingId(generateId());
    charQueueRef.current = [];
    isProcessingRef.current = false;

    // Create abort controller for this request
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

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              // Streaming complete - wait for char queue to finish then finalize
              const waitForQueue = () => {
                if (charQueueRef.current.length === 0 && !isProcessingRef.current) {
                  // Small delay then finalize
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
                  fullResponse += parsed.text;
                  // Add characters to queue
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
        // Request was cancelled, ignore
        return;
      }
      console.error("Chat error:", error);
      // Show error message
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
  }, [messages, processCharQueue, streamingId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="relative w-full max-w-lg h-[70vh] bg-white rounded-3xl shadow-2xl shadow-black/15 overflow-hidden flex flex-col border border-neutral-200"
    >
      {/* Clean header area */}
      <div className="px-6 py-4 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="Bounty" 
            width={16} 
            height={16}
            className="object-contain"
          />
          <span className="text-sm font-medium text-neutral-800">Bounty Agent</span>
        </div>
      </div>

      {/* Messages area - clean top, chaos bottom */}
      <div className="relative flex-1 flex flex-col bg-gradient-to-b from-white to-neutral-50">
        <ChatMessages 
          messages={messages} 
          isTyping={isTyping} 
          streamingMessage={streamingMessage}
          streamingId={streamingId}
        />
        
        {/* Halftone chaos overlay at bottom */}
        <HalftoneOverlay />
      </div>

      {/* Input area */}
      <ChatInput onSend={handleSend} disabled={isTyping} />
    </motion.div>
  );
}
