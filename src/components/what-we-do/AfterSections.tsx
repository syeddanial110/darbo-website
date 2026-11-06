import { useEffect, useRef, useState } from "react";
import portrait from "@/assets/what-we-do/darbo-wireframe-portrait.png.asset.json";

const clamp = (v: number) => Math.max(0, Math.min(1, v));

/** progress of an element through the viewport, 0 when its top hits bottom, 1 when its bottom hits top */
function useViewProgress<T extends HTMLElement>(mode: "through" | "pinned" = "through") {
  const ref = useRef<T>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const el = ref.current;
      if (el) {
        const r = el.getBoundingClientRect();
        const vh = innerHeight;
        setP(mode === "pinned" ? clamp(-r.top / (r.height - vh)) : clamp((vh - r.top) / (vh + r.height)));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode]);
  return [ref, p] as const;
}

export function AfterSections() {
  return (
    <div id="after-cinematic">
      <MeetArchitect />
      <StartBuilding />
    </div>
  );
}

function MeetArchitect() {
  const [ref, p] = useViewProgress<HTMLElement>();
  const mesh = Math.sin(p * Math.PI); // spreads then recedes
  return (
    <section ref={ref} id="who-we-are" className="relative grid min-h-svh grid-cols-1 items-center gap-12 px-[6vw] py-32 md:grid-cols-12">
      <div className="relative md:col-span-6 md:col-start-1">
        <div className="relative aspect-square overflow-hidden">
          <img src={portrait.url} alt="Portrait of Darbo, half human and half blue wireframe" loading="lazy" width={400} height={400} className="h-full w-full object-cover" style={{ transform: `scale(${1.04 - p * 0.04})` }} />
          <div aria-hidden className="absolute inset-0 bg-[linear-gradient(var(--hairline)_1px,transparent_1px),linear-gradient(90deg,var(--hairline)_1px,transparent_1px)] bg-[size:22px_22px] mix-blend-screen" style={{ clipPath: `inset(0 0 0 ${100 - mesh * 50}%)`, opacity: 0.7 }} />
        </div>
        <p className="mono-label mt-4 text-muted-foreground">Fig. 01 — Darbo, architect</p>
      </div>
      <div className="md:col-span-5 md:col-start-8">
        <p className="mono-label text-electric-glow">Meet the architect</p>
        <h2 className="font-display-tight mt-6 text-[clamp(2.5rem,6vw,6rem)]">People<br />come first.<br /><span className="text-gradient-gold">Always.</span></h2>
        
      </div>
    </section>
  );
}

export function StartBuilding() {
  return (
    <section id="contact" className="relative overflow-hidden border-t border-hairline">
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-ink via-ink/80 to-ink" />
      <div className="relative px-[6vw] pb-12 pt-40">
        <p className="font-display-wide text-[clamp(3rem,13vw,14rem)] leading-none text-foreground/[0.06]">LeadZLoco</p>
        <div className="-mt-[6vw] flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <h2 className="font-display-tight text-[clamp(2.4rem,6vw,6rem)]">Ready to<br /><span className="text-gradient-electric">run it?</span></h2>
          <a href="mailto:hello@leadzloco.com" className="font-display-wide bg-gradient-electric px-12 py-7 text-base text-primary-foreground transition-transform hover:-translate-y-0.5">Start building →</a>
        </div>
        <footer className="mono-label mt-32 grid gap-8 border-t border-hairline pt-8 text-muted-foreground md:grid-cols-4">
          <p>Lead<span className="text-gold">Z</span>Loco<br />Architect of headless agentic AI systems</p>
          <p>hello@leadzloco.com</p>
          <p className="flex gap-6"><a href="https://www.linkedin.com" className="hover:text-foreground">LinkedIn</a><a href="https://x.com" className="hover:text-foreground">X</a><a href="https://www.youtube.com" className="hover:text-foreground">YouTube</a></p>
          <p className="md:text-right">© 2026 LeadZLoco</p>
        </footer>
      </div>
    </section>
  );
}
