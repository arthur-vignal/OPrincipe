"use client";

import { useEffect, useRef, useState } from "react";

/**
 * CorruptedText — text that scrambles glyph-by-glyph before resolving.
 * Same shape as the EncryptedText used on the Sulfur landing page:
 * initially renders random characters, then iterates resolving
 * each position to its final char after `startDelayMs`.
 *
 * Used for the O PRINCIPE hero manifesto (black on white). Tracks
 * viewport entry so the reveal starts when scrolled into view.
 */

const GLYPHS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-={}[];:,.<>/?│┤┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌";

export function CorruptedText({
  text,
  className,
  startDelayMs = 200,
  revealStepMs = 28,
  flipIntervalMs = 60,
}: {
  text: string;
  className?: string;
  startDelayMs?: number;
  revealStepMs?: number;
  flipIntervalMs?: number;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState<string>(text);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) {
      // Show fully-corrupted state while waiting
      const corrupted = text
        .split("")
        .map((c) => (c === " " || c === "\n" ? c : randomGlyph()))
        .join("");
      setDisplay(corrupted);
      return;
    }

    let cancelled = false;
    let revealed = 0;
    let lastFlip = performance.now();
    const total = text.length;
    const startTime = performance.now() + startDelayMs;

    function randomGlyph(): string {
      return GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length));
    }

    function tick(now: number) {
      if (cancelled) return;
      const elapsed = now - startTime;
      const nextRevealed = Math.max(
        0,
        Math.min(total, Math.floor(elapsed / Math.max(1, revealStepMs))),
      );

      if (nextRevealed > revealed) revealed = nextRevealed;

      // Re-scramble unrevealed positions on flip interval
      if (now - lastFlip >= flipIntervalMs) {
        const out = text
          .split("")
          .map((c, i) => {
            if (i < revealed) return c;
            if (c === " " || c === "\n") return c;
            return randomGlyph();
          })
          .join("");
        setDisplay(out);
        lastFlip = now;
      }

      if (revealed < total) {
        requestAnimationFrame(tick);
      } else {
        setDisplay(text);
      }
    }

    requestAnimationFrame(tick);
    return () => {
      cancelled = true;
    };
  }, [inView, text, startDelayMs, revealStepMs, flipIntervalMs]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      {display}
    </span>
  );
}