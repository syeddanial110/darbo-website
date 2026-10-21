import { useEffect, useRef, useState, type ReactNode } from "react";
import { HERO_VIDEO } from "@/cinematic/config";

// Full-screen looping banner. Reduced-motion users get the poster only (see .hero-video in styles.css).
export function HeroVideo({ children }: { children?: ReactNode }) {
  const video = useRef<HTMLVideoElement>(null);
  // Starts muted so autoplay is allowed; the click that unmutes counts as the user gesture.
  const [muted, setMuted] = useState(true);
  const toggleSound = () => {
    const el = video.current;
    if (!el) return;
    el.muted = !el.muted;
    if (!el.muted) el.play().catch(() => {});
    setMuted(el.muted);
  };

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      if (mq.matches) el.pause();
      else el.play().catch(() => {});
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <section
      aria-label="LeadZLoco"
      className="hero-video relative w-full overflow-hidden bg-stage"
      style={{ backgroundImage: `url(${HERO_VIDEO.poster})` }}
    >
      <video
        ref={video}
        className="absolute inset-0 h-full w-full object-cover"
        src={HERO_VIDEO.src}
        poster={HERO_VIDEO.poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
        tabIndex={-1}
        disablePictureInPicture
      />
      <div className="hero-scrim pointer-events-none absolute inset-x-0 top-0 h-40" />
      <div className="absolute inset-x-0 top-0 z-10">{children}</div>
      <button
        type="button"
        onClick={toggleSound}
        aria-pressed={!muted}
        aria-label={muted ? "Turn video sound on" : "Turn video sound off"}
        className="hero-sound hud-btn absolute bottom-8 left-[6vw] z-10 bg-stage/50 backdrop-blur-sm"
      >
        Sound {muted ? "off" : "on"}
      </button>
    </section>
  );
}
