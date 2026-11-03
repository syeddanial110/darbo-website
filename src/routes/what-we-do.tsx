import { createFileRoute, Link } from "@tanstack/react-router";
import {
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MutableRefObject,
  type ReactNode,
  type RefObject,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { WHAT_WE_DO_ASSETS as A } from "@/cinematic/config";
import { SiteHeader } from "@/components/SiteHeader";
import {
  CHAPTERS,
  CLOSING,
  INTRO,
  PIPELINE,
  servicesFor,
  TICKER,
  type Service,
} from "@/components/what-we-do/data";
import { ServiceIcon } from "@/components/what-we-do/Icons";

// Three.js is heavy and client-only, so the scenes load on demand once a chapter nears the viewport.
const ChapterScene = lazy(() => import("@/components/what-we-do/Scenes"));

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const SITE_DESCRIPTION =
  "LeadZLoco architects intelligent systems that allow businesses to do what was previously limited by people, time, technology and scale.";

export const Route = createFileRoute("/what-we-do")({
  head: () => ({
    meta: [
      { title: "What We Do — LeadZLoco™" },
      {
        name: "description",
        content:
          "LeadZLoco architects intelligent systems — agentic AI, headless AI, sales, communication and workforce systems — that let businesses operate at a completely different scale.",
      },
      { property: "og:title", content: "What We Do — LeadZLoco™" },
      {
        property: "og:description",
        content:
          "Four chapters of systems: The Intelligence, The Growth, The Conversation, The Scale. You bring us the problem; we build the system that solves it.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "What We Do — LeadZLoco™" },
      {
        name: "twitter:description",
        content:
          "Agentic AI, headless AI, growth, conversation and workforce systems — architected around your business.",
      },
    ],
    links: [
      { rel: "preload", as: "image", href: A.darbo },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "What We Do — LeadZLoco™",
          description: SITE_DESCRIPTION,
          mainEntity: {
            "@type": "ItemList",
            itemListElement: CHAPTERS.flatMap((c) => servicesFor(c.id)).map((s, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: { "@type": "Service", name: s.title, description: s.description },
            })),
          },
        }),
      },
    ],
  }),
  component: WhatWeDo,
});

// ---- Scroll plumbing -------------------------------------------------------------------------

let lenisInstance: Lenis | null = null;

function useLenis(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenisInstance = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.refresh();
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisInstance = null;
    };
  }, [enabled]);
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

// Flips to true the first time the element comes within rootMargin of the viewport.
function useNearViewport(ref: RefObject<HTMLElement | null>, rootMargin = "600px") {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, near, rootMargin]);
  return near;
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenisInstance) lenisInstance.scrollTo(el, { duration: 1.4 });
  else el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---- Header, chapter rail, footer -------------------------------------------------------------

function ChapterRail({ reduced }: { reduced: boolean }) {
  const [active, setActive] = useState(1);
  const [open, setOpen] = useState(false);
  const fill = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        fill.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top 60%", end: "bottom 70%", scrub: 0.5 },
        },
      );
    });
    return () => ctx.revert();
  }, [reduced]);

  useEffect(() => {
    const triggers = CHAPTERS.map((c, i) =>
      ScrollTrigger.create({
        trigger: `#chapter-${c.id}`,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => {
          if (self.isActive) setActive(i + 1);
        },
      }),
    );
    return () => triggers.forEach((t) => t.kill());
  }, []);

  const go = (id: string) => {
    setOpen(false);
    scrollToId(id);
  };

  return (
    <div
      ref={root}
      className="pointer-events-none fixed left-5 top-1/2 z-40 hidden -translate-y-1/2 md:block"
    >
      <div className="pointer-events-auto flex flex-col items-center gap-4">
        <p className="font-ticker text-[0.55rem] tracking-[0.35em] text-muted-foreground">
          CHAPTER
        </p>
        <div className="relative h-40 w-px bg-chrome/10">
          <div
            ref={fill}
            aria-hidden
            className="absolute inset-0 origin-top bg-gradient-to-b from-gold to-glow shadow-[0_0_10px_1px_var(--color-gold)]"
          />
          {CHAPTERS.map((c, i) => {
            const isActive = active === c.id;
            return (
              <button
                key={c.id}
                onClick={() => go(`chapter-${c.id}`)}
                aria-label={`Go to chapter ${c.label}: ${c.title}`}
                aria-current={isActive ? "true" : undefined}
                style={{ top: `${(i / (CHAPTERS.length - 1)) * 100}%` }}
                className="absolute -left-3 flex h-7 w-7 -translate-y-1/2 items-center justify-center"
              >
                <span
                  className={`h-2 w-2 rounded-full transition-all duration-500 ${isActive ? "scale-125 bg-gold shadow-[0_0_10px_2px_var(--color-gold)]" : "bg-chrome/25 hover:bg-glow"}`}
                />
                <span
                  className={`absolute -left-1 whitespace-nowrap font-ticker text-[0.6rem] tracking-[0.25em] transition-all duration-500 ${isActive ? "-translate-x-8 text-gold" : "-translate-x-6 text-chrome/30"}`}
                >
                  {c.label}
                </span>
              </button>
            );
          })}
        </div>
        <p
          key={active}
          className="max-w-[7rem] text-center font-display text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-chrome/80"
        >
          {CHAPTERS[active - 1]?.title}
        </p>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="mt-4 rounded-full border border-border px-3 py-1 font-ticker text-[0.55rem] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:border-glow/50 hover:text-chrome"
        >
          Skip
        </button>
        {open && (
          <div className="panel flex w-44 flex-col gap-1 p-3">
            {CHAPTERS.map((c) => (
              <button
                key={c.id}
                onClick={() => go(`chapter-${c.id}`)}
                className="rounded px-2 py-1.5 text-left font-display text-xs text-chrome/80 transition-colors hover:bg-midnight hover:text-gold"
              >
                <span className="mr-2 font-ticker text-muted-foreground">{c.label}</span>
                {c.title}
              </button>
            ))}
            <button
              onClick={() => go("closing")}
              className="rounded px-2 py-1.5 text-left font-display text-xs text-chrome/80 transition-colors hover:bg-midnight hover:text-gold"
            >
              <span className="mr-2 font-ticker text-muted-foreground">··</span>Closing
            </button>
            <button
              onClick={() => go("cta")}
              className="rounded px-2 py-1.5 text-left font-display text-xs text-chrome/80 transition-colors hover:bg-midnight hover:text-gold"
            >
              <span className="mr-2 font-ticker text-muted-foreground">→</span>Start the
              conversation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Footer() {
  const link = "text-chrome/80 transition-colors hover:text-gold";
  return (
    <footer className="relative border-t border-border/60 bg-space-black">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-glow/60 to-transparent"
      />
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-3 md:px-8">
        <div>
          <p className="font-display text-lg font-bold text-chrome">
            LeadZLoco<span className="align-super text-[0.55em] text-gold">™</span>
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Architect of Headless Agentic AI Systems. Building businesses that scale without limits.
          </p>
        </div>
        <nav aria-label="Footer" className="text-sm">
          <p className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Site
          </p>
          <ul className="mt-4 space-y-3">
            <li>
              <Link to="/who-we-are" className={link}>
                Who We Are
              </Link>
            </li>
            <li>
              <Link to="/what-we-do" className={link}>
                What We Do
              </Link>
            </li>
          </ul>
        </nav>
        <div className="text-sm">
          <p className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Follow
          </p>
          <ul className="mt-4 space-y-3">
            <li>
              <a
                href="https://www.linkedin.com/company/leadzloco"
                target="_blank"
                rel="noreferrer"
                className="text-chrome/80 transition-colors hover:text-glow"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href="https://www.youtube.com/@leadzloco"
                target="_blank"
                rel="noreferrer"
                className="text-chrome/80 transition-colors hover:text-glow"
              >
                YouTube
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/40 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} LeadZLoco™. Every system serves people first.
      </div>
    </footer>
  );
}

// ---- Scroll-scrubbed words ---------------------------------------------------------------------

function ScrollWords({
  text,
  trigger,
  reduced,
  className = "",
  as: Tag = "p",
}: {
  text: string;
  trigger?: RefObject<HTMLElement | null>;
  reduced: boolean;
  className?: string;
  as?: "p" | "h2";
}) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (reduced || !ref.current) return;
    const el = ref.current;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll("[data-word]"),
        { autoAlpha: 0.08, y: 14, filter: "blur(6px)" },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          stagger: 0.06,
          ease: "none",
          scrollTrigger: {
            trigger: trigger?.current ?? el,
            start: trigger ? "top top" : "top 80%",
            end: trigger ? "center center" : "top 35%",
            scrub: 0.4,
          },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [reduced, trigger]);

  const words = text.split(" ");
  return (
    <Tag ref={ref as never} className={className}>
      {words.map((w, i) => (
        <span key={i} data-word className="inline-block will-change-transform">
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}

// ---- Hero ------------------------------------------------------------------------------------

function Hero({ reduced }: { reduced: boolean }) {
  const section = useRef<HTMLElement>(null);
  const thread = useRef<HTMLDivElement>(null);
  const ticker = useRef<HTMLDivElement>(null);
  const cue = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        thread.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: "center center",
            scrub: 0.5,
          },
        },
      );
      gsap.fromTo(
        ticker.current,
        { x: 0 },
        {
          x: "-12%",
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.5,
          },
        },
      );
      gsap.to(cue.current, {
        autoAlpha: 0,
        y: -20,
        scrollTrigger: {
          trigger: section.current,
          start: "top top+=40",
          end: "+=300",
          scrub: true,
        },
      });
    });
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={section} aria-labelledby="wwd-title" className="relative h-[190vh]">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-5">
        <div aria-hidden className="thread absolute top-24 left-0 h-0.5 w-full">
          <div
            ref={thread}
            className="h-full w-full origin-left"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--color-glow) 10%, var(--color-glow) 90%, transparent)",
              transform: "scaleX(0)",
            }}
          />
        </div>
        <div className="max-w-4xl text-center">
          <p className="ticker-caps text-glow">LeadZLoco · Services</p>
          <h1
            id="wwd-title"
            className="mt-4 font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight text-chrome text-glow md:text-8xl"
          >
            What We Do
          </h1>
          <ScrollWords
            reduced={reduced}
            trigger={section}
            text={INTRO}
            className="mx-auto mt-8 max-w-3xl text-balance text-lg leading-relaxed text-muted-foreground md:text-2xl"
          />
        </div>
        <div aria-hidden className="absolute bottom-16 left-0 w-full overflow-hidden opacity-70">
          <div
            ref={ticker}
            className="whitespace-nowrap ticker-caps text-chrome/60 will-change-transform"
          >
            <span>{TICKER.repeat(3)}</span>
          </div>
        </div>
        <div
          ref={cue}
          className="absolute bottom-5 flex flex-col items-center gap-1 text-muted-foreground"
        >
          <span className="ticker-caps text-[0.55rem] text-chrome/50">Scroll</span>
          <span aria-hidden className="animate-bounce text-lg text-glow">
            ↓
          </span>
        </div>
      </div>
      <button
        onClick={() => scrollToId("chapter-1")}
        className="sr-only focus:not-sr-only focus:absolute focus:left-1/2 focus:top-4 focus:z-50 focus:-translate-x-1/2 focus:bg-gold focus:px-4 focus:py-2 focus:font-display focus:text-sm focus:text-space-black"
      >
        Skip to Chapter 1
      </button>
    </section>
  );
}

// ---- Service cards and chapters --------------------------------------------------------------

function ServiceCard({
  service,
  index,
  className = "",
  style,
  large,
}: {
  service: Service;
  index: number;
  className?: string;
  style?: CSSProperties;
  large?: boolean;
}) {
  return (
    <article
      data-dock
      style={style}
      className={`panel chromatic panel-hover group relative overflow-hidden p-5 md:p-6 ${large ? "md:p-10" : ""} ${className}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cobalt/10 blur-2xl transition-opacity duration-500 group-hover:bg-gold/15"
      />
      <div className="flex items-start gap-4">
        <span
          aria-hidden
          className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-glow/25 bg-midnight/60 text-glow shadow-[0_0_18px_-6px_var(--color-glow)]"
        >
          <ServiceIcon icon={service.icon} className="h-5 w-5" />
        </span>
        <h3
          className={`font-display font-semibold text-chrome ${large ? "text-2xl md:text-4xl" : "text-base md:text-lg"} leading-snug`}
        >
          {service.title}
        </h3>
      </div>
      <p
        className={`mt-3 text-sm leading-relaxed text-muted-foreground ${large ? "mt-5 text-base md:text-lg md:leading-relaxed" : ""}`}
      >
        {service.description}
      </p>
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-3 right-4 font-ticker text-[0.6rem] tracking-[0.3em] text-muted-foreground/50"
      >
        {String(index + 1).padStart(2, "0")}
      </span>
    </article>
  );
}

// Cards dock in one by one as the pinned chapter scrolls; `progress` also drives the 3D scene.
function useDockedCards(
  section: RefObject<HTMLElement | null>,
  progress: MutableRefObject<number>,
  reduced: boolean,
) {
  useLayoutEffect(() => {
    if (reduced) return;
    const root = section.current;
    if (!root) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-dock]", root);
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.7,
          onUpdate: (self) => {
            progress.current = self.progress;
          },
        },
      });
      cards.forEach((card, i) => {
        tl.fromTo(
          card,
          { autoAlpha: 0, y: 56, rotateX: 6 },
          { autoAlpha: 1, y: 0, rotateX: 0, duration: 1, ease: "power2.out" },
          (i + 0.7) / (cards.length + 1.3),
        );
      });
      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    });
    mm.add("(max-width: 767px)", () => {
      gsap.utils.toArray<HTMLElement>("[data-dock]", root).forEach((card) => {
        gsap.fromTo(
          card,
          { autoAlpha: 0, y: 40 },
          {
            autoAlpha: 1,
            y: 0,
            ease: "power2.out",
            scrollTrigger: { trigger: card, start: "top 92%", end: "top 62%", scrub: true },
          },
        );
      });
      ScrollTrigger.create({
        trigger: root,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          progress.current = self.progress;
        },
      });
    });
    return () => mm.revert();
  }, [reduced, progress, section]);
}

// Staggered placement of each chapter's cards inside the pinned stage. Exposed as custom properties so
// they only take effect from md: up; on phones the cards stack at full width.
const cardPos = (top: string, left: string | undefined, width: string) =>
  ({ "--card-top": top, "--card-left": left, "--card-width": width }) as CSSProperties;

const CARD_POSITIONS: Record<1 | 2 | 3, (i: number) => CSSProperties> = {
  1: (i) => cardPos(`${5 + i * 19}%`, ["2%", "11%", "4%", "13%", "6%"][i], "min(27rem, 46vw)"),
  2: (i) => cardPos(`${5 + i * 19}%`, i % 2 ? "15%" : "0%", "min(25rem, 44vw)"),
  3: (i) =>
    cardPos(
      `${6 + i * 18.6}%`,
      ["0%", "9%", "3%", "12%", "6%"][i],
      i % 2 ? "min(23rem, 42vw)" : "min(27rem, 46vw)",
    ),
};

function Thread({
  section,
  side,
  reduced,
}: {
  section: RefObject<HTMLElement | null>;
  side: "left" | "right";
  reduced: boolean;
}) {
  const fill = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (reduced) {
      if (fill.current) fill.current.style.transform = "scaleY(1)";
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        fill.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            start: "top 80%",
            end: "bottom 70%",
            scrub: 0.6,
          },
        },
      );
    });
    return () => ctx.revert();
  }, [reduced, section]);

  return (
    <div
      aria-hidden
      className={`thread absolute inset-y-0 z-10 hidden w-0.5 md:block ${side === "left" ? "left-0" : "right-0"}`}
    >
      <div
        ref={fill}
        className="h-full w-full origin-top"
        style={{
          background:
            "linear-gradient(180deg, transparent, var(--color-glow) 12%, var(--color-glow) 88%, transparent)",
          transform: "scaleY(0)",
        }}
      />
    </div>
  );
}

function Chapter({
  id,
  reduced,
  stageSide,
  stageOverlay,
}: {
  id: 1 | 2 | 3;
  reduced: boolean;
  stageSide: "left" | "right";
  stageOverlay?: ReactNode;
}) {
  const chapter = CHAPTERS.find((c) => c.id === id)!;
  const services = servicesFor(id);
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);
  useDockedCards(section, progress, reduced);
  const near = useNearViewport(section);

  return (
    <section
      id={`chapter-${id}`}
      ref={section}
      aria-labelledby={`chapter-${id}-title`}
      className="relative md:h-[520vh]"
    >
      <Thread section={section} side={stageSide} reduced={reduced} />
      <div className="relative flex flex-col md:sticky md:top-0 md:h-screen md:flex-row md:overflow-hidden">
        <div
          className={`relative h-[38vh] md:h-full md:w-[55%] ${stageSide === "left" ? "md:order-1" : "md:order-2"}`}
        >
          {near && (
            <Suspense fallback={null}>
              <ChapterScene
                id={id}
                progress={progress}
                reduced={reduced}
                className="absolute inset-0"
              />
            </Suspense>
          )}
          <div className="absolute bottom-4 left-5 max-w-xs md:bottom-10 md:left-12">
            <p className="ticker-caps text-gold">
              {chapter.label} · {chapter.kicker}
            </p>
            <h2
              id={`chapter-${id}-title`}
              className="mt-2 font-display text-3xl font-bold uppercase leading-none text-chrome text-glow md:text-5xl"
            >
              The {chapter.title.split(" ")[1]}
            </h2>
          </div>
          {stageOverlay}
        </div>
        <div
          className={`relative z-10 flex-1 bg-gradient-to-b from-space-black/90 via-space-black/95 to-space-black md:bg-transparent ${stageSide === "left" ? "md:order-2" : "md:order-1"}`}
        >
          <div className="flex flex-col gap-6 px-5 pb-16 pt-10 md:absolute md:inset-0 md:p-0">
            {services.map((s, i) => (
              <ServiceCard
                key={s.title}
                service={s}
                index={i}
                className="md:absolute md:top-(--card-top) md:left-(--card-left) md:w-(--card-width)"
                style={CARD_POSITIONS[id](i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---- Chapter 4 and the proof-of-scale reveal ---------------------------------------------------

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

function Scale({ reduced }: { reduced: boolean }) {
  const services = servicesFor(4);
  const cards = services.slice(0, 4);
  const proof = services[4]!;
  const chapter = useRef<HTMLElement>(null);
  const reveal = useRef<HTMLElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const labels = useRef<(HTMLSpanElement | null)[]>([]);
  const hall = useRef<HTMLImageElement>(null);
  const skyline = useRef<HTMLImageElement>(null);

  // Pipeline marker and the four cards.
  useLayoutEffect(() => {
    if (reduced) {
      if (dotRef.current) dotRef.current.style.left = "100%";
      labels.current.forEach((l) => l?.classList.add("text-gold"));
      return;
    }
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      const root = chapter.current!;
      const docks = gsap.utils.toArray<HTMLElement>("[data-dock]", root);
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.7,
          onUpdate: (self) => {
            const p = self.progress;
            if (dotRef.current) dotRef.current.style.left = `${clamp01(p / 0.45) * 100}%`;
            labels.current.forEach((l, i) => {
              const lit = (1 / 0.45) * p * 1.05 >= i / (PIPELINE.length - 1);
              l?.classList.toggle("text-gold", lit);
              l?.classList.toggle("text-chrome/30", !lit);
            });
          },
        },
      });
      docks.forEach((d, i) => {
        tl.fromTo(
          d,
          { autoAlpha: 0, y: 56 },
          { autoAlpha: 1, y: 0, duration: 1, ease: "power2.out" },
          0.5 + i * 0.12,
        );
      });
      tl.to({}, { duration: 0.5 });
      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    });
    mm.add("(max-width: 767px)", () => {
      ScrollTrigger.create({
        trigger: chapter.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          if (dotRef.current) dotRef.current.style.left = `${clamp01(self.progress / 0.6) * 100}%`;
        },
      });
      gsap.utils.toArray<HTMLElement>("[data-dock]", chapter.current!).forEach((d) => {
        gsap.fromTo(
          d,
          { autoAlpha: 0, y: 40 },
          {
            autoAlpha: 1,
            y: 0,
            ease: "power2.out",
            scrollTrigger: { trigger: d, start: "top 92%", end: "top 62%", scrub: true },
          },
        );
      });
    });
    return () => mm.revert();
  }, [reduced]);

  // Workforce hall zooms out and dissolves into the skyline.
  useLayoutEffect(() => {
    if (reduced) return;
    const mm = gsap.matchMedia();
    const build = (trigger: HTMLElement) => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger, start: "top top", end: "bottom bottom", scrub: 0.7 },
      });
      tl.fromTo(
        hall.current,
        { scale: 2.1, filter: "brightness(0.9)" },
        { scale: 1, filter: "brightness(1.05)", ease: "none", duration: 0.55 },
      );
      tl.fromTo(skyline.current, { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.3 }, 0.45);
      tl.fromTo(skyline.current, { scale: 1.15 }, { scale: 1, ease: "none", duration: 0.55 }, 0.45);
      tl.fromTo(
        "[data-statement]",
        { autoAlpha: 0, y: 70 },
        { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" },
        0.62,
      );
      tl.to({}, { duration: 0.38 });
      return tl;
    };
    mm.add("(min-width: 768px)", () => {
      const tl = build(reveal.current!);
      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    });
    mm.add("(max-width: 767px)", () => {
      const tl = build(reveal.current!);
      if (tl.scrollTrigger) {
        tl.scrollTrigger.vars.start = "top 60%";
        tl.scrollTrigger.vars.end = "bottom top";
        tl.scrollTrigger.refresh();
      }
      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    });
    return () => mm.revert();
  }, [reduced]);

  return (
    <>
      <section
        id="chapter-4"
        ref={chapter}
        aria-labelledby="chapter-4-title"
        className="relative md:h-[460vh]"
      >
        <div className="md:sticky md:top-0 md:flex md:h-screen md:flex-col md:justify-center md:overflow-hidden">
          <div className="relative px-5 pt-20 md:px-16 md:pt-8">
            <p className="ticker-caps text-gold">04 · Workforce, operations, infrastructure</p>
            <h2
              id="chapter-4-title"
              className="mt-2 font-display text-3xl font-bold uppercase leading-none text-chrome text-glow md:text-5xl"
            >
              The Scale
            </h2>
            <div
              className="relative mt-8 md:mt-12"
              role="img"
              aria-label={`Pipeline: ${PIPELINE.join(", ")}`}
            >
              <div
                aria-hidden
                className="h-px w-full bg-gradient-to-r from-glow/10 via-glow/60 to-glow/10 md:h-0.5"
              />
              <div
                ref={dotRef}
                aria-hidden
                className="absolute -top-[7px] h-3 w-3 -translate-x-1/2 rounded-full bg-gold shadow-[0_0_16px_4px_var(--color-gold)] transition-none"
                style={{ left: "0%" }}
              />
              <div className="mt-3 flex justify-between">
                {PIPELINE.map((label, i) => (
                  <span
                    key={label}
                    ref={(el) => {
                      labels.current[i] = el;
                    }}
                    className={`font-ticker text-[0.5rem] tracking-[0.15em] uppercase md:text-[0.65rem] md:tracking-[0.22em] ${reduced ? "text-gold" : "text-chrome/30"}`}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-10 grid gap-5 px-5 pb-16 md:mt-14 md:grid-cols-12 md:gap-6 md:px-16 md:pb-0">
            <div className="md:col-span-5 md:[margin-top:2rem]">
              <ServiceCard service={cards[0]!} index={0} />
            </div>
            <div className="md:col-span-4">
              <ServiceCard service={cards[1]!} index={1} />
            </div>
            <div className="md:col-span-3 md:[margin-top:3rem]">
              <ServiceCard service={cards[2]!} index={2} />
            </div>
            <div className="md:col-span-6 md:[margin-top:-1rem]">
              <ServiceCard service={cards[3]!} index={3} />
            </div>
          </div>
        </div>
      </section>

      <section
        ref={reveal}
        className="relative md:h-[340vh]"
        aria-label="Operating at a completely different scale"
      >
        <div className="relative md:sticky md:top-0 md:h-screen md:overflow-hidden">
          <div className="relative h-[60vh] overflow-hidden md:h-full">
            <img
              ref={hall}
              src={A.hall}
              alt="Rows of humanoid robots working at call-center workstations in a vast hall"
              width={1920}
              height={1080}
              loading="lazy"
              className="h-full w-full object-cover will-change-transform"
            />
            <img
              ref={skyline}
              src={A.skyline}
              alt="A city skyline of towers with lit windows at night"
              width={1920}
              height={1080}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-0 will-change-transform"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-space-black via-transparent to-space-black/60"
            />
          </div>
          <div
            data-statement
            className="relative z-10 -mt-24 px-5 md:absolute md:bottom-16 md:left-16 md:mt-0 md:max-w-2xl md:px-0"
          >
            <p className="ticker-caps mb-3 text-gold">The proof of scale</p>
            <ServiceCard service={proof} index={4} large className="md:bg-midnight/80" />
          </div>
        </div>
      </section>
    </>
  );
}

// ---- Closing statement, contact form, founder ---------------------------------------------------

function Closing({ reduced }: { reduced: boolean }) {
  const section = useRef<HTMLElement>(null);
  const fade = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        fade.current,
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            start: "bottom 40%",
            end: "bottom top",
            scrub: 0.5,
          },
        },
      );
    });
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      id="closing"
      ref={section}
      aria-label="Closing statement"
      className="relative h-[190vh]"
    >
      <div className="sticky top-0 flex h-screen items-center justify-center px-5">
        <ScrollWords
          reduced={reduced}
          trigger={section}
          as="h2"
          text={CLOSING}
          className="max-w-5xl text-balance text-center font-display text-3xl font-bold leading-tight text-chrome text-glow md:text-6xl"
        />
      </div>
      <div
        ref={fade}
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-space-black"
      />
    </section>
  );
}

const FIELD =
  "w-full rounded-lg border border-input bg-space-black/70 px-4 py-3 text-chrome placeholder:text-muted-foreground/50 focus:border-glow focus:outline-none focus:ring-2 focus:ring-cobalt/40";

function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <section id="cta" aria-labelledby="cta-title" className="relative overflow-hidden bg-midnight">
      <div
        aria-hidden
        className="thread absolute inset-x-0 top-0 h-0.5 w-full bg-gradient-to-r from-transparent via-glow to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-cobalt/15 blur-[120px]"
      />
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 md:grid-cols-2 md:px-8 md:py-32">
        <div>
          <p className="ticker-caps text-glow">Start the conversation</p>
          <h2
            id="cta-title"
            className="mt-4 font-display text-4xl font-bold leading-tight text-chrome md:text-6xl"
          >
            Bring us the problem.
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
            Tell us what’s limited by people, time, technology or scale. We’ll show you the system.
          </p>
          <p className="mt-8 max-w-md text-sm text-muted-foreground/80">
            A person — not a bot — reads every message. We reply within one business day.
          </p>
        </div>
        {sent ? (
          <div className="panel flex flex-col items-start justify-center p-8" role="status">
            <p className="font-display text-2xl font-semibold text-gold text-glow-gold">
              Message received.
            </p>
            <p className="mt-3 text-muted-foreground">
              Thanks for laying it out — a real person will get back to you within one business day.
              Grab a coffee; the heavy lifting is ours.
            </p>
            <button
              onClick={() => setSent(false)}
              className="mt-6 font-ticker text-xs tracking-[0.2em] text-glow uppercase"
            >
              Send another →
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="panel space-y-5 p-6 md:p-8"
            aria-label="Tell us about your problem"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-2 block font-display font-medium text-chrome">Name</span>
                <input
                  required
                  name="name"
                  autoComplete="name"
                  placeholder="Jordan Reyes"
                  className={FIELD}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-2 block font-display font-medium text-chrome">Email</span>
                <input
                  required
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="jordan@company.com"
                  className={FIELD}
                />
              </label>
            </div>
            <label className="block text-sm">
              <span className="mb-2 block font-display font-medium text-chrome">Company</span>
              <input
                name="company"
                autoComplete="organization"
                placeholder="Company or team"
                className={FIELD}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-2 block font-display font-medium text-chrome">
                What’s the problem?
              </span>
              <textarea
                required
                name="problem"
                rows={5}
                placeholder="Follow-up takes hours nobody has. Our database has 40,000 dormant leads. Onboarding new hires takes three weeks…"
                className={`${FIELD} resize-y`}
              />
            </label>
            <button type="submit" className="gold-button w-full sm:w-auto">
              Start the conversation
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

function Founder() {
  return (
    <section aria-labelledby="human-title" className="relative overflow-hidden bg-space-black">
      <img
        src={A.skyline}
        alt=""
        aria-hidden
        width={1920}
        height={1080}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-20"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-space-black via-space-black/70 to-space-black/40"
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-24 md:grid-cols-2 md:px-8 md:py-36">
        <div className="relative order-2 md:order-1">
          <div
            aria-hidden
            className="absolute inset-6 -z-10 rounded-full bg-glow/25 blur-[90px] md:inset-10"
          />
          <img
            src={A.darbo}
            alt="Darbo, founder of LeadZLoco, wearing red-framed glasses and a black zip jacket in blue rim light"
            className="chromatic relative w-full max-w-md rounded-2xl border border-glow/20 shadow-[0_0_60px_-15px_var(--color-glow)] md:max-w-lg"
          />
          <p className="mt-4 font-ticker text-xs tracking-[0.3em] text-muted-foreground">
            DARBO · FOUNDER · ARCHITECT
          </p>
        </div>
        <div className="order-1 md:order-2">
          <p className="ticker-caps text-glow">The human behind the system</p>
          <h2
            id="human-title"
            className="mt-4 font-display text-4xl font-bold leading-tight text-chrome md:text-6xl"
          >
            Technology evolves.{" "}
            <span className="text-gold text-glow-gold">Vision remains human.</span>
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
            Every system we build ends with a person picking up a conversation, taking a call,
            closing a deal. That’s the point.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <button onClick={() => scrollToId("cta")} className="gold-button">
              Book a conversation
            </button>
            <Link to="/who-we-are" className="ghost-button inline-flex items-center">
              Who we are
            </Link>
          </div>
          <div className="mt-6 flex gap-6 font-ticker text-xs uppercase tracking-[0.25em]">
            <a
              href="https://www.linkedin.com/company/leadzloco"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground transition-colors hover:text-glow"
            >
              LinkedIn ↗
            </a>
            <a
              href="https://www.youtube.com/@leadzloco"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground transition-colors hover:text-glow"
            >
              YouTube ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---- Page --------------------------------------------------------------------------------------

function WhatWeDo() {
  const reduced = useReducedMotion();
  useLenis(!reduced);

  return (
    <div className="wwd">
      <SiteHeader current="what-we-do" contactHref="#cta" />
      <ChapterRail reduced={reduced} />
      <main>
        <Hero reduced={reduced} />
        <Chapter id={1} reduced={reduced} stageSide="left" />
        <Chapter
          id={2}
          reduced={reduced}
          stageSide="right"
          stageOverlay={
            <p
              aria-hidden
              className="absolute right-4 top-4 hidden font-ticker text-[0.55rem] tracking-[0.3em] text-chrome/40 md:right-8 md:top-8 md:block"
            >
              DISCOVERY → QUALIFICATION → PIPELINE → RECOVERY
            </p>
          }
        />
        <Chapter
          id={3}
          reduced={reduced}
          stageSide="left"
          stageOverlay={
            <p
              aria-hidden
              className="absolute left-1/2 top-4 hidden -translate-x-1/2 font-ticker text-[0.55rem] tracking-[0.3em] text-chrome/40 md:top-8 md:block"
            >
              TEXT · EMAIL · WEB CHAT · SOCIAL · VOICE
            </p>
          }
        />
        <Scale reduced={reduced} />
        <Closing reduced={reduced} />
        <Contact />
        <Founder />
      </main>
      <Footer />
      <div aria-hidden className="grain" />
    </div>
  );
}
