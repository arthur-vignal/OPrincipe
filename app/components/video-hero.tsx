"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { CorruptedText } from "./corrupted-text";
import { ArrowRight } from "lucide-react";
import { Link } from "@remix-run/react";

/**
 * VideoHero — full-bleed ASCII video taking the entire viewport with
 * the manifesto overlay in white on top, left-aligned, vertically
 * centered. The text is small (mono terminal feel) and the
 * 'Acessar Coleção' CTA sits below as a small white pill.
 *
 * When videoSrc is undefined, a black placeholder with scanlines is
 * shown so the hero still has visual weight.
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
        "relative w-screen -mx-[calc((100vw-100%)/2)] overflow-hidden bg-black",
        "h-[calc(100vh-3.5rem)] min-h-[480px]",
        className,
      )}
    >
      {/* Background video — full bleed, object-cover, fills entire hero */}
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

      {/* Manifesto overlay — big white Michroma text, left-aligned, no background */}
      <div className="absolute inset-0 flex flex-col items-start justify-center pl-6 md:pl-10 lg:pl-16 pr-4 md:pr-6 pointer-events-none">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-white max-w-[60%] m-0"
          style={{
            fontFamily: "Michroma, sans-serif",
            fontSize: "clamp(28px, 5.2vw, 72px)",
            letterSpacing: "-0.015em",
            lineHeight: 1.1,
            fontWeight: 400,
            textShadow: "0 0 16px rgba(0,0,0,0.7)",
          }}
        >
          <CorruptedText text={`[${manifesto}]`} />
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          className="mt-8 md:mt-10 pointer-events-auto"
        >
          <Link
            to={collectionHref}
            className="group inline-flex items-center gap-2.5 px-6 py-3.5 border border-white/50 bg-white/10 backdrop-blur-sm text-white text-display text-[11px] tracking-[0.22em] hover:bg-white hover:text-black transition-colors"
          >
            ACESSAR COLEÇÃO
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
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