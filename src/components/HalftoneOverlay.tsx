"use client";

export default function HalftoneOverlay() {
  return (
    <div className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none overflow-hidden">
      {/* SVG Pattern Definition */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Stochastic dot pattern */}
          <pattern
            id="halftone-dots"
            x="0"
            y="0"
            width="4"
            height="4"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="0.8" fill="black" />
            <circle cx="3" cy="3" r="0.5" fill="black" />
          </pattern>
          
          {/* Larger scattered dots */}
          <pattern
            id="halftone-large"
            x="0"
            y="0"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="6" r="1" fill="black" />
            <circle cx="6" cy="2" r="0.7" fill="black" />
            <circle cx="4" cy="4" r="0.4" fill="black" />
          </pattern>

          {/* Gradient mask for transition */}
          <linearGradient id="halftone-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="30%" stopColor="white" stopOpacity="0.3" />
            <stop offset="60%" stopColor="white" stopOpacity="0.7" />
            <stop offset="100%" stopColor="white" stopOpacity="1" />
          </linearGradient>

          <mask id="halftone-mask">
            <rect width="100%" height="100%" fill="url(#halftone-fade)" />
          </mask>
        </defs>

        {/* Base layer with small dots */}
        <rect
          width="100%"
          height="100%"
          fill="url(#halftone-dots)"
          mask="url(#halftone-mask)"
          opacity="0.6"
        />
        
        {/* Second layer with larger dots for variation */}
        <rect
          width="100%"
          height="100%"
          fill="url(#halftone-large)"
          mask="url(#halftone-mask)"
          opacity="0.4"
        />
      </svg>

      {/* Additional noise texture using CSS */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.02) 50%, rgba(0,0,0,0.08) 100%)`,
          maskImage: `linear-gradient(to bottom, transparent 0%, black 100%)`,
          WebkitMaskImage: `linear-gradient(to bottom, transparent 0%, black 100%)`,
        }}
      />
    </div>
  );
}
