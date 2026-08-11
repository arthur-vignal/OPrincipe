"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { CorruptedText } from "./corrupted-text";

/**
 * VideoHero — full-bleed (100vw) hero that overflows past the
 * viewport bottom and is cropped via object-cover. The video fills
 * the entire width with no side margins; the top nav sits on top of
 * it as an overlay.
 *
 * Manifesto overlay: black monospace text on a translucent black
 * card, sized to ~half the viewport, left-aligned, NO side margins
 * (touches the left edge with breathing room). Wrapped in [ ].
 * Animated via CorruptedText (glyph-by-glyph scramble).
 *
 * When videoSrc is undefined, a PlaceholderPattern fills the slot
 * so the hero still has visual weight.
 */
export function VideoHero({
  videoSrc,
  videoWebmSrc,
  manifesto,
  className,
}: {
  videoSrc?: string;
  videoWebmSrc?: string;
  manifesto: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {
      // autoplay might be blocked; user can still click play
    });
  }, [videoSrc]);

  return (
    <section
      className={cn(
        // Full bleed: spans entire viewport width, no horizontal padding.
        // Height: viewport minus the top nav (h-14 = 3.5rem).
        // Overflow past the bottom is cropped by the next section.
        "relative w-screen -mx-[calc((100vw-100%)/2)] overflow-hidden bg-black",
        "h-[calc(100vh-3.5rem)] min-h-[480px]",
        className,
      )}
    >
      {/* Background video — object-cover to fill entire width */}
      {videoSrc ? (
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          {videoWebmSrc && <source src={videoWebmSrc} type="video/webm" />}
        </video>
      ) : (
        <PlaceholderPattern />
      )}

      {/* Manifesto overlay — touches left edge, vertically centered, NO background.
          Pure text sitting on top of the video. */}
      <div className="absolute inset-0 flex items-center pl-4 md:pl-8 pr-4 md:pr-8 pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="max-w-[55%] text-white"
          style={{
            fontFamily: "Michroma, monospace",
            fontSize: "clamp(20px, 3.2vw, 48px)",
            letterSpacing: "-0.01em",
            lineHeight: 1.15,
          }}
        >
          <CorruptedText text={`[${manifesto}]`} />
        </motion.div>
      </div>
    </section>
  );
}

function cn(...args: any[]) {
  return args.filter(Boolean).join(" ");
}

/**
 * PlaceholderPattern — used until the user uploads the ASCII car
 * video. Renders a black background with a subtle scanline grid +
 * "VIDEO PENDING" centered text. Keeps the hero height stable so the
 * page below it doesn't shift when the real video lands.
 */
function PlaceholderPattern() {
  return (
    <div className="absolute inset-0 w-full h-full bg-black overflow-hidden">
      {/* scanlines */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 4px)",
        }}
      />
      {/* centered text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white/40">
          <div className="text-display text-[10px] tracking-[0.32em] mb-2">
            ◦ VIDEO PENDING
          </div>
          <div className="text-[11px] tracking-[0.2em] text-white/30">
            ASCII CAR 16:9
          </div>
        </div>
      </div>
    </div>
  );
}