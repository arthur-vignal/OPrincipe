"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { CorruptedText } from "./corrupted-text";
import { ArrowRight } from "lucide-react";
import { Link } from "@remix-run/react";

/**
 * VideoHero — split horizontal layout, 50/50:
 *   left: manifesto text + "Acessar Coleção" CTA, vertically centered
 *   right: the ASCII car video filling the entire right half with
 *           object-cover (no black bars; crop instead).
 *
 * Manifesto overlay is in the LEFT column only — never invades the
 * video. Animated via CorruptedText (glyph-by-glyph scramble).
 *
 * When videoSrc is undefined, the right half shows a PlaceholderPattern
 * so the layout still has visual weight.
 */
export function VideoHero({
  videoSrc,
  videoWebmSrc,
  manifesto,
  collectionHref = "/collections/club-001-virtu",
  className,
}: {
  videoSrc?: string;
  videoWebmSrc?: string;
  manifesto: string;
  collectionHref?: string;
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
        // Full viewport width. Height = viewport minus top nav.
        "relative w-screen -mx-[calc((100vw-100%)/2)] overflow-hidden bg-white",
        "h-[calc(100vh-3.5rem)] min-h-[480px]",
        className,
      )}
    >
      <div className="grid h-full w-full" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {/* LEFT — manifesto + CTA */}
        <div className="flex flex-col items-start justify-center pl-6 md:pl-10 lg:pl-16 pr-4 md:pr-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-black max-w-full"
            style={{
              fontFamily: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace",
              fontSize: "clamp(20px, 3.4vw, 52px)",
              letterSpacing: "-0.015em",
              lineHeight: 1.25,
              fontWeight: 500,
            }}
          >
            {/* Prompt + text */}
            <div className="text-[12px] tracking-[0.32em] uppercase text-black/40 mb-3">
              ◦ PRINCIPIO.txt
            </div>
            <h1 className="m-0">
              <CorruptedText text={`[${manifesto}]`} />
            </h1>
            {/* Footer prompt */}
            <div className="text-[12px] tracking-[0.18em] text-black/40 mt-3">
              $ <span className="animate-pulse">▌</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.5 }}
            className="mt-8 md:mt-10"
          >
            <Link
              to={collectionHref}
              className="group inline-flex items-center gap-2.5 px-6 py-3.5 bg-black text-white text-display text-[11px] tracking-[0.22em] hover:bg-red transition-colors"
            >
              ACESSAR COLEÇÃO
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* RIGHT — video, object-cover to crop */}
        <div className="relative h-full w-full overflow-hidden bg-black">
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
        </div>
      </div>
    </section>
  );
}

function cn(...args: any[]) {
  return args.filter(Boolean).join(" ");
}

/**
 * PlaceholderPattern — used until the user uploads the video.
 * Black bg + scanlines + 'VIDEO PENDING' centered text. Only fills
 * the right half of the hero (the video column).
 */
function PlaceholderPattern() {
  return (
    <div className="absolute inset-0 w-full h-full bg-black overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 4px)",
        }}
      />
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