"use client";

import { useEffect, useRef, useState } from "react";

type HeroCounterProps = {
  value: number;
  /** Live site: Elementor counter, 0 → value over 4000ms. */
  durationMs?: number;
};

const format = (n: number) => Math.round(n).toLocaleString("en-US");

/**
 * Counts up from 0 when scrolled into view, like the live Elementor counter.
 * Server-renders the final value so it is correct without JavaScript.
 */
export default function HeroCounter({ value, durationMs = 4000 }: HeroCounterProps) {
  const [display, setDisplay] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    setDisplay(0);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / durationMs);
          const eased = 1 - Math.pow(1 - t, 4);
          setDisplay(value * eased);
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, durationMs]);

  return (
    <span ref={ref} aria-label={format(value)}>
      {format(display)}
    </span>
  );
}
