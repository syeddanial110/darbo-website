import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";

export function Preloader({ done }: { done: boolean }) {
  return (
    <div aria-hidden className="fixed inset-0 z-50 flex items-center bg-ink transition-opacity duration-700" style={{ opacity: done ? 0 : 1, pointerEvents: done ? "none" : "auto" }}>
      <div className="h-px w-full animate-draw-line bg-gradient-electric" />
    </div>
  );
}

export function Nav({ visible }: { visible: boolean }) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-[4vw] py-5 transition-all duration-700" style={{ opacity: visible ? 1 : 0, transform: `translateY(${visible ? 0 : -16}px)`, pointerEvents: visible ? "auto" : "none" }}>
      <Link to="/" className="font-display-wide text-sm">Lead<span className="text-gold">Z</span>Loco</Link>
      <nav className="mono-label hidden gap-8 md:flex" aria-label="Main">
        <Link to="/" activeOptions={{ exact: true, includeHash: false }} activeProps={{ className: "text-foreground" }} inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}>Home</Link>
        <Link to="/" hash="who-we-are" className="text-muted-foreground hover:text-foreground">Who we are</Link>
        <Link to="/what-we-do" activeProps={{ className: "text-foreground" }} inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}>What we do</Link>
        <Link to="/" hash="contact" className="text-muted-foreground hover:text-foreground">Contact</Link>
      </nav>
      <a href="mailto:hello@leadzloco.com" className="mono-label border border-gold px-4 py-2 text-gold hover:bg-gold hover:text-ink">Start building</a>
    </header>
  );
}

/** Context-aware cursor: ring grows on links/buttons, shows "Drag" hint over canvases. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"idle" | "link">("idle");
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    setEnabled(true);
    document.body.classList.add("has-cursor");
    let x = 0, y = 0, rx = 0, ry = 0, raf = 0;
    const move = (e: MouseEvent) => {
      x = e.clientX; y = e.clientY;
      const t = e.target as HTMLElement;
      setMode(t.closest("a,button") ? "link" : "idle");
    };
    const loop = () => {
      rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
      if (dot.current) dot.current.style.transform = `translate(${x}px,${y}px)`;
      if (ring.current) ring.current.style.transform = `translate(${rx}px,${ry}px)`;
      raf = requestAnimationFrame(loop);
    };
    addEventListener("mousemove", move);
    raf = requestAnimationFrame(loop);
    return () => { removeEventListener("mousemove", move); cancelAnimationFrame(raf); document.body.classList.remove("has-cursor"); };
  }, []);
  if (!enabled) return null;
  return (
    <>
      <div ref={dot} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[60] -ml-[2px] -mt-[2px] h-1 w-1 bg-signal" />
      <div ref={ring} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[60]">
        <div className={`-translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-300 ${mode === "link" ? "h-14 w-14 border-gold" : "h-8 w-8 border-electric-glow/60"}`} />
      </div>
    </>
  );
}
