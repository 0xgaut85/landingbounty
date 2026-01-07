"use client";

import { useEffect, useState } from "react";

function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";
  
  const key = "bounty_visitor_id";
  let id = localStorage.getItem(key);
  
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  
  return id;
}

export default function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const trackVisitor = async () => {
      const visitorId = getOrCreateVisitorId();
      if (!visitorId) return;

      try {
        const response = await fetch("/api/visitors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitorId }),
        });

        const data = await response.json();
        if (data.count !== null) {
          setCount(data.count);
        }
      } catch (error) {
        console.error("Failed to track visitor:", error);
      }
    };

    trackVisitor();
  }, []);

  if (count === null) return null;

  return (
    <div className="fixed bottom-4 left-4 text-xs text-neutral-600 font-light">
      {count.toLocaleString()} visitors
    </div>
  );
}
