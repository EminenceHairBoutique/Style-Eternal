// src/components/reviews/RatingStars.jsx
import React from "react";
import { Star } from "lucide-react";

export default function RatingStars({
  value = 0,
  size = 14,
  interactive = false,
  onChange,
  className = "",
}) {
  const rounded = Math.round(Number(value) || 0);

  if (!interactive) {
    return (
      <span
        className={`inline-flex items-center gap-0.5 ${className}`}
        role="img"
        aria-label={`${value} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            size={size}
            aria-hidden="true"
            className={n <= rounded ? "text-se-gold" : "text-se-steel/40"}
            fill={n <= rounded ? "currentColor" : "none"}
          />
        ))}
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1 ${className}`}
      role="radiogroup"
      aria-label="Your rating"
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onClick={() => onChange?.(n)}
          className="p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-se-gold"
        >
          <Star
            size={size + 4}
            aria-hidden="true"
            className={n <= value ? "text-se-gold" : "text-se-steel/50 hover:text-se-gold/60"}
            fill={n <= value ? "currentColor" : "none"}
          />
        </button>
      ))}
    </div>
  );
}
