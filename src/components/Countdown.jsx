import { useEffect, useState } from "react";

/**
 * Countdown — live ticking timer to a target ISO datetime.
 * Renders Days / Hrs / Min / Sec. Returns null once the target passes and
 * fires onComplete once. Used by the drop calendar and drop detail pages.
 */
function remaining(target) {
  const ms = new Date(target).getTime() - Date.now();
  if (Number.isNaN(ms) || ms <= 0) return null;
  const s = Math.floor(ms / 1000);
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

const pad = (n) => String(n).padStart(2, "0");

export default function Countdown({ target, onComplete, className = "", compact = false }) {
  const [time, setTime] = useState(() => remaining(target));

  useEffect(() => {
    setTime(remaining(target));
    const id = setInterval(() => {
      const r = remaining(target);
      setTime(r);
      if (!r) {
        clearInterval(id);
        onComplete?.();
      }
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  if (!time) return null;

  const units = [
    ["Days", time.d],
    ["Hrs", time.h],
    ["Min", time.m],
    ["Sec", time.s],
  ];

  return (
    <div className={className} role="timer" aria-label="Time until drop">
      <div className={`flex ${compact ? "gap-2" : "gap-3 md:gap-4"}`}>
        {units.map(([label, val]) => (
          <div key={label} className="flex flex-col items-center">
            <span
              className={`font-display text-se-bone tabular-nums leading-none ${
                compact ? "text-lg" : "text-2xl md:text-3xl"
              }`}
            >
              {pad(val)}
            </span>
            <span className="text-[9px] tracking-[0.2em] uppercase text-se-steel font-accent mt-1.5">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
