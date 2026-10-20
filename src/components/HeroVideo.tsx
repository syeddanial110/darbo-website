import { useEffect, useRef, type ReactNode } from "react";
import { HERO_VIDEO } from "@/cinematic/config";

// Full-screen looping banner. Reduced-motion users get the poster only (see .hero-video in styles.css).
export function HeroVideo({ children }: { children?: ReactNode }) {
  const video = useRef<HTMLVideoElement>(null);

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
    </section>
  );
}
