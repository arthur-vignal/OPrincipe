"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { CorruptedText } from "./corrupted-text";

/**
 * VideoHero — full-bleed landscape (16:9) hero with:
 * - An ASCII car video as background (mp4/webm autoplay muted loop).
 * - A black-on-white corrupted manifesto overlay aligned left,
 *   capped at half the viewport width.
 * - The overlay sits inside the video bounds, with a slight white
 *   padding/glow so it remains readable over the ASCII.
 *
 * When `videoSrc` is undefined (during dev before the user uploads
 * the video), a placeholder pattern is shown so the layout still
 * looks intentional.
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

  // Some browsers require an explicit play() call after mount
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
        "relative w-full bg-black overflow-hidden",
        // 16:9 ratio pinned to viewport height for a cinematic hero
        "aspect-[16/9] max-h-[calc(100vh-3.5rem)]",
        className,
      )}
    >
      {/* Background video (or placeholder) */}
      {videoSrc ? (
        <video
          ref={videoRef}
          src={videoSrc}
          poster={undefined}
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

      {/* Manifesto overlay — black on white, left-aligned, max half width */}
      <div className="absolute inset-0 pointer-events-none flex items-center">
        <div className="px-6 md:px-10 w-full">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="max-w-[50%] bg-white/90 backdrop-blur-sm p-5 md:p-7 text-black text-[13px] md:text-[15px] leading-[1.5] font-mono whitespace-pre-wrap"
            style={{ fontFamily: "Michroma, monospace" }}
          >
            <CorruptedText text={`[${manifesto}]`} />
          </motion.div>
        </div>
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