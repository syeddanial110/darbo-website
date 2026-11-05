import { createFileRoute, Link } from "@tanstack/react-router";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { WHAT_WE_DO_ASSETS as A, WHAT_WE_DO_VIDEO } from "@/cinematic/config";
import { SiteHeader } from "@/components/SiteHeader";
import { CHAPTERS, CLOSING, servicesFor, TICKER, type Service } from "@/components/what-we-do/data";
import { ServiceIcon } from "@/components/what-we-do/Icons";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const SITE_DESCRIPTION =
  "LeadZLoco architects intelligent systems that allow businesses to do what was previously limited by people, time, technology and scale.";

export const Route = createFileRoute("/what-we-do")({
  head: () => ({
    meta: [
      { title: `What We Do — LeadZLoco™` },
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

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenisInstance) lenisInstance.scrollTo(el, { duration: 1.4 });
  else el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---- Footer ----------------------------------------------------------------------------------

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
  const ticker = useRef<HTMLDivElement>(null);
  const cue = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  // Reduced-motion visitors get a still frame instead of looping footage.
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (reduced) el.pause();
    else el.play().catch(() => {});
  }, [reduced]);

  useLayoutEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
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
        <video
          ref={video}
          className="absolute inset-0 h-full w-full object-cover"
          src={WHAT_WE_DO_VIDEO.src}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
          tabIndex={-1}
          disablePictureInPicture
        />
        {/* Light scrim keeps the header and bottom ticker legible over the footage. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, color-mix(in oklab, var(--color-space-black) 40%, transparent), color-mix(in oklab, var(--color-space-black) 15%, transparent) 40%, color-mix(in oklab, var(--color-space-black) 70%, transparent))",
          }}
        />
        <div className="relative max-w-4xl text-center">
          {/* Visually hidden: keeps the page's h1 for screen readers and SEO. */}
          <h1 id="wwd-title" className="sr-only">
            What We Do
          </h1>
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

// ---- Service cards ----------------------------------------------------------------------------

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

// ---- Proof-of-scale reveal ---------------------------------------------------------------------

function Scale({ reduced }: { reduced: boolean }) {
  const services = servicesFor(4);
  const proof = services[4]!;
  const reveal = useRef<HTMLElement>(null);
  const hall = useRef<HTMLImageElement>(null);
  const skyline = useRef<HTMLImageElement>(null);

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
      <main>
        <Hero reduced={reduced} />
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
