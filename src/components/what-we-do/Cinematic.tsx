import { useEffect, useMemo, useRef, useState } from "react";
import type Lenis from "lenis";
import { SCENES, OUTRO_VH, OUTRO_SECONDS, HEADLINE_DWELL, RESUME_AFTER_MS } from "@/config/home-scenes";
import { PoseSequence } from "./PoseSequence";
import { EarthCanvas } from "./EarthCanvas";
import { useHum } from "./useHum";

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

type Props = { lenis: Lenis | null; started: boolean; reduced: boolean; onFinish: () => void; finished: boolean };

export function Cinematic({ lenis, started, reduced, onFinish, finished }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const [p, setP] = useState(0); // overall cinematic progress 0..1 — single source of truth
  const [playing, setPlaying] = useState(false);
  const [sound, setSound] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const totalVh = SCENES.reduce((s, c) => s + c.scrollVh, 0) + OUTRO_VH;
  const bounds = useMemo(() => {
    let acc = 0;
    const b = SCENES.map((s) => {
      const from = acc / totalVh;
      acc += s.scrollVh;
      return { from, to: acc / totalVh };
    });
    b.push({ from: acc / totalVh, to: 1 });
    return b;
  }, [totalVh]);

  useHum(sound, p, playing);

  // scroll -> progress
  useEffect(() => {
    if (!lenis) return;
    const update = () => {
      const el = sectionRef.current;
      if (!el) return;
      const top = el.offsetTop;
      const len = el.offsetHeight - window.innerHeight;
      const v = clamp((lenis.scroll - top) / len);
      setP(v);
      if (v >= 0.999 && !finished) onFinish();
    };
    update();
    lenis.on("scroll", update);
    return () => lenis.off("scroll", update);
  }, [lenis, finished, onFinish]);

  // auto-scroll engine
  const engine = useRef({ raf: 0, timer: 0 as number | ReturnType<typeof setTimeout>, resume: 0 as number | ReturnType<typeof setTimeout>, manualPause: false });
  const playRef = useRef<() => void>(() => {});
  const pauseRef = useRef<(manual: boolean) => void>(() => {});

  useEffect(() => {
    if (!lenis || !started) return;
    const eng = engine.current;
    const el = sectionRef.current!;
    // f > 1 means "bottom of the whole page" (auto-scroll continues through the site)
    const px = (f: number) => (f > 1 ? lenis.limit : el.offsetTop + f * (el.offsetHeight - window.innerHeight));
    // stops: headline-landed point (dwell) then scene end (glide through)
    const stops: { from: number; to: number; dur: number; dwell: boolean }[] = [];
    bounds.forEach((b, i) => {
      const total = i < SCENES.length ? SCENES[i]!.autoSeconds - HEADLINE_DWELL : OUTRO_SECONDS;
      const mid = b.from + (b.to - b.from) * 0.36;
      stops.push({ from: b.from, to: mid, dur: total * 0.45, dwell: i < SCENES.length });
      stops.push({ from: mid, to: b.to, dur: total * 0.55, dwell: false });
    });
    // after the film: glide gently through the rest of the page to the footer

    const stop = () => {
      cancelAnimationFrame(eng.raf);
      clearTimeout(eng.timer);
    };
    const runSegment = () => {
      const cur = lenis.scroll;
      const idx = stops.findIndex((b) => px(b.to) - cur > 2);
      if (idx === -1) { setPlaying(false); return; }
      const b = stops[idx]!;
      const to = px(b.to), from = px(b.from);
      const remaining = clamp((to - cur) / (to - from), 0.05, 1);
      const dur = Math.max(0.6, b.dur * remaining) * 1000;
      const start = performance.now();
      const step = (now: number) => {
        const t = clamp((now - start) / dur);
        const e = b.from >= 1 ? t : easeInOut(t); // steady pace through the site
        lenis.scrollTo(cur + (to - cur) * e, { immediate: true, force: true });
        if (t < 1) eng.raf = requestAnimationFrame(step);
        else eng.timer = setTimeout(runSegment, b.dwell ? HEADLINE_DWELL * 1000 : 0);
      };
      eng.raf = requestAnimationFrame(step);
    };
    const play = () => {
      stop();
      clearTimeout(eng.resume);
      eng.manualPause = false;
      setPlaying(true);
      runSegment();
    };
    const pause = (manual: boolean) => {
      stop();
      setPlaying(false);
      clearTimeout(eng.resume);
      if (manual) eng.manualPause = true;
      else if (!eng.manualPause)
        eng.resume = setTimeout(() => {
          if (lenis.scroll < lenis.limit - 2) play();
        }, RESUME_AFTER_MS);
    };
    playRef.current = play;
    pauseRef.current = pause;

    const onUser = (e: Event) => {
      if (e instanceof KeyboardEvent && !["ArrowDown", "ArrowUp", " ", "PageDown", "PageUp", "Home", "End"].includes(e.key)) return;
      if (e instanceof PointerEvent && e.clientX < document.documentElement.clientWidth) return; // scrollbar only
      pause(false);
    };
    window.addEventListener("wheel", onUser, { passive: true });
    window.addEventListener("touchstart", onUser, { passive: true });
    window.addEventListener("keydown", onUser);
    window.addEventListener("pointerdown", onUser);
    play();
    return () => {
      stop();
      clearTimeout(eng.resume);
      window.removeEventListener("wheel", onUser);
      window.removeEventListener("touchstart", onUser);
      window.removeEventListener("keydown", onUser);
      window.removeEventListener("pointerdown", onUser);
    };
  }, [lenis, started, bounds]);

  // mouse tilt (desktop)
  useEffect(() => {
    if (!window.matchMedia("(hover: hover)").matches) return;
    const m = (e: MouseEvent) => setTilt({ x: e.clientX / innerWidth - 0.5, y: e.clientY / innerHeight - 0.5 });
    addEventListener("mousemove", m);
    return () => removeEventListener("mousemove", m);
  }, []);

  const skip = () => {
    pauseRef.current(true);
    const after = document.getElementById("after-cinematic");
    if (after && lenis) lenis.scrollTo(after, { immediate: true, force: true });
    onFinish();
  };

  const local = (i: number) => range(p, bounds[i]!.from, bounds[i]!.to);
  const vis = (i: number) => {
    // fade through black: out over the last slice, in over the first
    const b = bounds[i]!, f = 0.02;
    const fin = i === 0 ? 1 : range(p, b.from, b.from + f);
    return clamp(fin * (1 - range(p, b.to - f, b.to)));
  };
  const activeScene = Math.min(SCENES.length - 1, bounds.findIndex((b) => p < b.to));

  return (
    <section ref={sectionRef} aria-label="The evolution of AI — a short film" style={{ height: `${totalVh + 100}svh` }} className="relative">
      <div className="sticky top-0 h-svh w-full overflow-hidden bg-ink">
        {SCENES.map((s, i) => {
          const lp = local(i);
          const o = reduced ? (vis(i) > 0.5 ? 1 : 0) : vis(i);
          if (o <= 0.001) return null;
          const push = 1 + (s.maxScale - 1) * lp;
          const tx = tilt.x * -14, ty = tilt.y * -10;
          return (
            <div key={s.id} className="absolute inset-0" style={{ opacity: o }}>
              {/* layered image plane */}
              <div className="absolute inset-[-3%] will-change-transform" style={{ transform: `translate3d(${tx}px, ${ty}px, 0) perspective(1200px) rotateY(${tilt.x * 1.5}deg) rotateX(${-tilt.y * 1.2}deg)` }}>
                {s.id === "world" ? (
                  <>
                    <EarthCanvas progress={lp} className="absolute inset-0 h-full w-full" />
                    <div className="absolute inset-0 mix-blend-screen" style={{ opacity: 0.35 + lp * 0.25 }}>
                      <PoseSequence label="Darbo as a translucent hologram above the planet" frames={s.frames} progress={lp} hologram scale={1.1 + lp * 0.05} focalX={0.5} className="h-full w-full [mask-image:radial-gradient(ellipse_40%_60%_at_50%_45%,black,transparent)]" />
                    </div>
                  </>
                ) : (
                  <PoseSequence
                    label={i === 0 ? "Darbo walking toward camera, transforming from human to machine" : i === 1 ? "Robot Darbo commanding a vast command center" : "Darbo on a platform above a golden future city"}
                    frames={s.frames}
                    progress={i === 0 ? range(lp, 0.22, 0.78) : lp}
                    dissolve={!!s.dissolve && !reduced}
                    scale={push}
                    focalX={s.focal.x}
                    className="h-full w-full"
                  />
                )}
              </div>
              <SceneFx id={s.id} lp={lp} reduced={reduced} />
              <Headline lines={s.headline} sub={s.subline} lp={lp} zone={s.textZone} accent={i === 3 ? "gold" : "electric"} />
            </div>
          );
        })}

        {/* outro title card */}
        {(() => {
          const lp = local(SCENES.length);
          if (lp <= 0) return null;
          return (
            <div className="absolute inset-0 flex flex-col items-start justify-center bg-ink px-[8vw]" style={{ opacity: range(lp, 0, 0.3) }}>
              <p className="mono-label text-electric-glow" style={{ opacity: range(lp, 0.25, 0.45) }}>LeadZLoco — Darbo</p>
              <h2 className="font-display-tight mt-6 text-[clamp(3rem,10vw,10rem)]" style={{ opacity: range(lp, 0.3, 0.55), transform: `translateY(${(1 - range(lp, 0.3, 0.6)) * 40}px)` }}>
                Lead<span className="text-gradient-gold">Z</span>Loco
              </h2>
              <p className="font-display-wide mt-6 max-w-3xl text-[clamp(0.9rem,1.6vw,1.4rem)] text-muted-foreground" style={{ opacity: range(lp, 0.5, 0.75) }}>
                Building businesses that scale without limits.
              </p>
            </div>
          );
        })()}

        {/* global overlays */}
        <div aria-hidden className="pointer-events-none absolute inset-0 vignette" />
        <div aria-hidden className="pointer-events-none absolute inset-0 scanlines" />
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden grain chroma-edge" />
        {!finished && <Hud p={p} scene={activeScene} />}

        {/* controls */}
        {!finished && (
          <div className="absolute bottom-5 right-5 z-20 flex items-center gap-4 border border-hairline bg-ink/70 px-4 py-3 backdrop-blur-sm md:bottom-8 md:right-8">
            {(
              <button onClick={() => (playing ? pauseRef.current(true) : playRef.current())} className="mono-label text-foreground hover:text-electric-glow" aria-label={playing ? "Pause film" : "Play film"}>
                {playing ? "❚❚ Pause" : "▶ Play"}
              </button>
            )}
            <div className="flex items-center gap-1.5" aria-label={`Scene ${activeScene + 1} of 4`}>
              {SCENES.map((s, i) => (
                <span key={s.id} className={`h-3 w-px transition-colors ${i <= activeScene ? "bg-electric-glow" : "bg-hairline"}`} />
              ))}
            </div>
            <button onClick={() => setSound((v) => !v)} className="mono-label text-muted-foreground hover:text-foreground" aria-pressed={sound}>
              Sound {sound ? "On" : "Off"}
            </button>
            <button onClick={skip} className="mono-label text-gold hover:text-gold-glow">Skip intro</button>
            <span aria-hidden className="absolute bottom-0 left-0 h-px bg-gradient-electric" style={{ width: `${p * 100}%` }} />
          </div>
        )}
      </div>
    </section>
  );
}

function Headline({ lines, sub, lp, zone, accent }: { lines: string[]; sub?: string | undefined; lp: number; zone: string; accent: "gold" | "electric" }) {
  const inT = range(lp, 0.08, 0.32);
  const out = 1 - range(lp, 0.86, 0.98);
  const pos =
    zone === "lower-left" ? "left-[6vw] bottom-[14svh] items-start text-left" :
    zone === "lower-right" ? "right-[6vw] bottom-[14svh] items-end text-right" :
    zone === "right" ? "right-[6vw] top-1/2 -translate-y-1/2 items-end text-right" :
    "left-[6vw] top-1/2 -translate-y-1/2 items-start text-left";
  return (
    <div className={`absolute z-10 flex max-w-[48vw] flex-col max-md:max-w-[88vw] max-md:bottom-[18svh] max-md:top-auto max-md:translate-y-0 ${pos}`} style={{ opacity: out }}>
      <h2 className="font-display-tight text-[clamp(2.6rem,7.4vw,8.5rem)]">
        {lines.map((l, k) => {
          const t = range(inT, k * 0.18, k * 0.18 + 0.55);
          const last = k === lines.length - 1;
          return (
            <span key={k} className="block overflow-hidden pb-[0.06em]">
              <span className={`block will-change-transform ${last ? (accent === "gold" ? "text-gradient-gold" : "text-gradient-electric") : ""}`} style={{ transform: `translateY(${(1 - t) * 105}%)` }}>
                {l}
              </span>
            </span>
          );
        })}
      </h2>
      {sub && <p className="mono-label mt-6 text-foreground/80" style={{ opacity: range(inT, 0.6, 1) }}>{sub}</p>}
    </div>
  );
}

function SceneFx({ id, lp, reduced }: { id: string; lp: number; reduced: boolean }) {
  if (reduced) return null;
  if (id === "transformation") {
    const scan = range(lp, 0.22, 0.78);
    const glitch = Math.abs(lp - 0.22) < 0.015 || Math.abs(lp - 0.5) < 0.012 || Math.abs(lp - 0.78) < 0.015;
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 animate-flicker bg-electric/10" />
        {scan > 0 && scan < 1 && (
          <div className="absolute inset-x-[30%] h-px bg-electric-glow shadow-[0_0_24px_4px_var(--electric-glow)]" style={{ top: `${8 + scan * 82}%` }} />
        )}
        {glitch && <div className="absolute inset-0 animate-glitch mix-blend-screen bg-electric/20" />}
        <div className="absolute inset-0 bg-ink" style={{ opacity: 1 - range(lp, 0, 0.1) }} />
      </div>
    );
  }
  if (id === "awakening") {
    const wake = range(lp, 0.05, 0.5);
    const ring = range(lp, 0.28, 0.6);
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-ink" style={{ opacity: 0.75 * (1 - wake) }} />
        {ring > 0 && ring < 1 && (
          <div className="absolute left-[36%] top-[8%] aspect-square w-[10vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-electric-glow" style={{ transform: `translate(-50%,-50%) scale(${1 + ring * 14})`, opacity: 1 - ring }} />
        )}
        <div className="mono-label absolute bottom-[6svh] left-[6vw] space-y-1 text-electric-glow/70 max-md:hidden" style={{ opacity: wake }}>
          <p>NODES ONLINE {String(Math.round(wake * 2048)).padStart(4, "0")}</p>
          <p>LATENCY {(12 - wake * 9).toFixed(1)}MS</p>
          <p>AGENTS {Math.round(wake * 64)}/64</p>
        </div>
      </div>
    );
  }
  if (id === "ascension") {
    const bloom = range(lp, 0.6, 0.92);
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,var(--gold-glow),transparent_55%)] mix-blend-screen" style={{ opacity: bloom * 0.45 }} />
        <div className="absolute h-px w-[30vw] bg-gradient-gold" style={{ top: "22%", left: `${-30 + lp * 160}%`, opacity: 0.8 }} />
        <div className="absolute h-px w-[18vw] bg-gradient-electric" style={{ top: "34%", left: `${130 - lp * 170}%`, opacity: 0.6 }} />
      </div>
    );
  }
  return null;
}

function Hud({ p, scene }: { p: number; scene: number }) {
  const show = (p * 37) % 1 < 0.8;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-10">
      <div className="absolute left-3 top-[15%] h-[70%] w-px bg-hairline md:left-6">
        <div className="w-px bg-gradient-electric" style={{ height: `${p * 100}%` }} />
      </div>
      {show && (
        <>
          <span className="absolute left-[3vw] top-[4svh] h-4 w-4 border-l border-t border-foreground/40" />
          <span className="absolute right-[3vw] top-[4svh] h-4 w-4 border-r border-t border-foreground/40" />
        </>
      )}
      <p className="mono-label absolute right-[3vw] top-[6svh] text-right text-foreground/50 max-md:hidden">
        SC.0{scene + 1} — 34.0522°N 118.2437°W
        <br />T+{(p * 60).toFixed(1)}S
      </p>
      <p className="mono-label absolute left-[3vw] top-[6svh] text-foreground/70">Lead<span className="text-gold">Z</span>Loco</p>
    </div>
  );
}
