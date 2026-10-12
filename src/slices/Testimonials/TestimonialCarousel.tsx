"use client";

import {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import styles from "./Testimonials.module.css";

type TestimonialCarouselProps = {
  slides: ReactNode[];
  /** Live site: autoplay every 3000ms, 500ms slide transition. */
  autoplayMs?: number;
  speedMs?: number;
};

/** Clones on each side — enough for the widest layout (3 cards). */
const CLONES = 3;
const SWIPE_THRESHOLD = 50;

/**
 * Infinite loop carousel matching the live Elementor loop carousel:
 * 3 / 2 / 1 cards (CSS breakpoints), 40px gap, 1 card per step, autoplay
 * that pauses on hover and stops after user interaction, bullet pagination.
 */
export default function TestimonialCarousel({
  slides,
  autoplayMs = 3000,
  speedMs = 500,
}: TestimonialCarouselProps) {
  const count = slides.length;
  const loop = count > 1;
  const clones = loop ? Math.min(CLONES, count) : 0;

  const [index, setIndex] = useState(clones);
  const [animate, setAnimate] = useState(true);
  const [dragPx, setDragPx] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [stopped, setStopped] = useState(false);
  const dragStart = useRef<number | null>(null);

  const go = useCallback((next: number) => {
    setAnimate(true);
    setIndex(next);
  }, []);

  // Autoplay (pause on hover, stop after interaction, respect reduced motion)
  useEffect(() => {
    if (!loop || hovered || stopped) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => go(index + 1), autoplayMs);
    return () => window.clearInterval(timer);
  }, [loop, hovered, stopped, index, autoplayMs, go]);

  // Jump from a clone back to the matching real slide without animating
  const handleTransitionEnd = () => {
    if (!loop) return;
    if (index >= clones + count) {
      setAnimate(false);
      setIndex(index - count);
    } else if (index < clones) {
      setAnimate(false);
      setIndex(index + count);
    }
  };

  useEffect(() => {
    if (animate) return;
    const frame = window.requestAnimationFrame(() => setAnimate(true));
    return () => window.cancelAnimationFrame(frame);
  }, [animate]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!loop || (event.pointerType === "mouse" && event.button !== 0)) return;
    dragStart.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStart.current === null) return;
    setDragPx(event.clientX - dragStart.current);
  };

  const endDrag = () => {
    if (dragStart.current === null) return;
    dragStart.current = null;
    if (Math.abs(dragPx) > SWIPE_THRESHOLD) {
      setStopped(true);
      go(dragPx < 0 ? index + 1 : index - 1);
    }
    setDragPx(0);
  };

  const track: ReactNode[] = loop
    ? [...slides.slice(count - clones), ...slides, ...slides.slice(0, clones)]
    : slides;
  const active = loop ? (((index - clones) % count) + count) % count : 0;

  return (
    <div
      className={styles.carousel}
      role="region"
      aria-roledescription="carousel"
      aria-label="Client reviews"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <div
        className={styles.viewport}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div
          className={styles.track}
          style={{
            ["--index" as string]: index,
            ["--drag" as string]: `${dragPx}px`,
            transitionDuration: animate && dragPx === 0 ? `${speedMs}ms` : "0ms",
          }}
          onTransitionEnd={handleTransitionEnd}
          aria-live="off"
        >
          {track.map((slide, position) => {
            const real = loop ? position - clones : position;
            const isClone = loop && (real < 0 || real >= count);
            const slideIndex = ((real % count) + count) % count;
            return (
              <div
                key={position}
                className={styles.slide}
                role="group"
                aria-roledescription="slide"
                aria-label={`${slideIndex + 1} / ${count}`}
                aria-hidden={isClone || undefined}
                inert={isClone || undefined}
              >
                {slide}
              </div>
            );
          })}
        </div>
      </div>

      {loop && (
        <div className={styles.pagination}>
          {slides.map((_, bullet) => (
            <button
              key={bullet}
              type="button"
              className={`${styles.bullet} ${bullet === active ? styles.bulletActive : ""}`}
              aria-label={`Go to slide ${bullet + 1}`}
              aria-current={bullet === active || undefined}
              onClick={() => {
                setStopped(true);
                go(clones + bullet);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
