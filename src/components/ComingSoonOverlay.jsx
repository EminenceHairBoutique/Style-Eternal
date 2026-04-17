// src/components/ComingSoonOverlay.jsx — Style Eternal
import React from "react";

const ComingSoonOverlay = ({ dropName, season, productName, className = "" }) => {
  return (
    <div
      className={`absolute inset-0 bg-gradient-to-t from-se-black/80 via-se-black/30 to-transparent flex flex-col items-center justify-end pb-6 ${className}`}
    >
      <div className="text-center px-4">
        {(dropName || season) && (
          <p className="text-[8px] tracking-[0.3em] uppercase text-se-gold/80 font-accent mb-1">
            {dropName || season}
          </p>
        )}
        {productName && (
          <p className="text-[10px] text-se-bone/60 font-accent truncate max-w-[140px]">
            {productName}
          </p>
        )}
        <span className="inline-flex items-center gap-1.5 mt-2 border border-se-bone/20 px-3 py-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-se-gold/70 animate-pulse" />
          <span className="text-[9px] tracking-[0.25em] uppercase text-se-bone/80 font-accent">
            Coming Soon
          </span>
        </span>
      </div>
    </div>
  );
};

export default ComingSoonOverlay;
