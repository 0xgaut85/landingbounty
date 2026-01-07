"use client";

import { useEffect, useRef, useState } from "react";

export default function IntroOverlay() {
  const [phase, setPhase] = useState<"black" | "revealing" | "done">("black");
  const progressRef = useRef(0);
  const [renderProgress, setRenderProgress] = useState(0);

  useEffect(() => {
    // Phase 1: Pure black screen for a brief moment
    const blackTimer = setTimeout(() => {
      setPhase("revealing");
    }, 250);

    return () => clearTimeout(blackTimer);
  }, []);

  useEffect(() => {
    if (phase !== "revealing") return;

    let animationId: number;
    let startTime: number | null = null;
    const duration = 2200; // Total animation duration

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      
      const elapsed = timestamp - startTime;
      const linearProgress = Math.min(elapsed / duration, 1);
      
      // Smooth easing: ease-out-quint for very fluid deceleration
      const eased = 1 - Math.pow(1 - linearProgress, 5);
      
      progressRef.current = eased;
      setRenderProgress(eased);

      if (linearProgress < 1) {
        animationId = requestAnimationFrame(animate);
      } else {
        // Small delay before removing overlay completely
        setTimeout(() => setPhase("done"), 50);
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [phase]);

  // Remove from DOM when done
  if (phase === "done") return null;

  // Pure black during initial phase
  if (phase === "black") {
    return (
      <div 
        className="fixed inset-0 z-50 pointer-events-none bg-black"
        style={{ willChange: "mask-image" }}
      />
    );
  }

  // Calculate gradient values for fluid reveal
  // Using viewport units for consistent sizing across screens
  const maxRadius = 160; // % - ensures full coverage
  const currentRadius = renderProgress * maxRadius;
  
  // Soft feathered edge - wider spread for more fluid look
  const fadeWidth = 50; // Width of the gradient transition zone
  const innerEdge = Math.max(0, currentRadius - fadeWidth / 2);
  const outerEdge = currentRadius + fadeWidth / 2;

  return (
    <div 
      className="fixed inset-0 z-50 pointer-events-none bg-black"
      style={{ 
        maskImage: `radial-gradient(circle at 50% 50%, transparent ${innerEdge}%, black ${outerEdge}%)`,
        WebkitMaskImage: `radial-gradient(circle at 50% 50%, transparent ${innerEdge}%, black ${outerEdge}%)`,
        willChange: "mask-image",
      }}
    />
  );
}
