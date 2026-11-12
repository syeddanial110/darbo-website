import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SiteHeader } from "@/components/SiteHeader";
import { HeroVideo } from "@/components/HeroVideo";
import { ABOUT_VIDEO, WORK_IMAGES } from "@/cinematic/config";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LeadZLoco™ — Architect of Headless Agentic AI Systems" },
      { name: "description", content: "Building businesses that scale without limits. Headless agentic AI systems, architected by Darbo." },
      { property: "og:title", content: "LeadZLoco™ — Architect of Headless Agentic AI Systems" },
      { property: "og:description", content: "Building businesses that scale without limits." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="bg-stage">
      <HeroVideo>
        <SiteHeader current="home" contactHref="#contact" />
      </HeroVideo>
      <Home />
    </main>
  );
}

const ROWS = [
  { n: "01", t: "Systems that think ahead", d: "Agentic architecture that works quietly behind your brand — wherever your customers are.", img: WORK_IMAGES.think, cta: "See what we build", href: "/what-we-do" },
  { n: "02", t: "Headless by design", d: "Your front end stays yours. Intelligence plugs in underneath, ready to scale.", img: WORK_IMAGES.headless, cta: "How it works", href: "/what-we-do" },
  { n: "03", t: "Built around people", d: "Technology evolves. The vision, the judgement and the relationships stay human.", img: WORK_IMAGES.people, cta: "Meet the team", href: "/who-we-are" },
];

// Full-bleed photo panels: the background drifts and settles (parallax + scale) as each panel scrolls
// through, the heading rises out of a mask word by word, the copy and button fade in over a dark tint.
// Static (fully visible) under reduced motion.
function WorkRows() {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>("[data-row]").forEach((row) => {
          const q = (s: string) => row.querySelectorAll(s);

          // Background: plain parallax (no scaling); the layer is oversized so edges never show.
          gsap.fromTo(
            q("[data-bg]"),
            { yPercent: -21 },
            { yPercent: 21, ease: "none", scrollTrigger: { trigger: row, start: "top bottom", end: "bottom top", scrub: true } },
          );

          // Foreground copy: staged reveal as the panel reaches the middle of the screen.
          gsap
            .timeline({ scrollTrigger: { trigger: row, start: "top 75%", end: "top 20%", scrub: 0.7 } })
            .fromTo(q("[data-num]"), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.4 }, 0)
            .fromTo(q("[data-word]"), { yPercent: 118, rotate: 4 }, { yPercent: 0, rotate: 0, ease: "power3.out", stagger: 0.12, duration: 0.7 }, 0.05)
            .fromTo(q("[data-desc]"), { autoAlpha: 0, y: 26, filter: "blur(10px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", ease: "power2.out", duration: 0.6 }, 0.35)
            .fromTo(q("[data-btn]"), { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.5 }, 0.55);

          // Content leaves a little faster than the photo for depth.
          gsap.fromTo(
            q("[data-content]"),
            { yPercent: 6 },
            { yPercent: -6, ease: "none", scrollTrigger: { trigger: row, start: "top bottom", end: "bottom top", scrub: true } },
          );
        });
      }, el);
      return () => ctx.revert();
    });
    return () => mm.revert();
  }, []);

  return (
    <div ref={root}>
      {ROWS.map((r) => (
        <div key={r.n} data-row className="relative flex min-h-[85svh] items-center justify-center overflow-hidden border-b border-border">
          <div data-bg aria-hidden className="absolute inset-x-0 -bottom-[40%] -top-[40%] will-change-transform">
            <img src={r.img} alt="" loading="lazy" className="h-full w-full object-cover" />
          </div>
          <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgb(0 0 0 / 0.55), rgb(0 0 0 / 0.38) 45%, rgb(0 0 0 / 0.7))" }} />
          <div data-content className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-[6vw] text-center">
            <span data-num className="eyebrow mb-5 text-gold">{r.n}</span>
            <h3 className="flex flex-wrap justify-center gap-x-[0.28em] text-4xl font-bold md:text-7xl" style={{ fontStretch: "115%" }}>
              {r.t.split(" ").map((w, k) => (
                <span key={k} className="-mb-[0.15em] inline-block overflow-hidden pb-[0.15em] align-top">
                  <span data-word className="inline-block will-change-transform">{w}</span>
                </span>
              ))}
            </h3>
            <p data-desc className="mt-6 max-w-xl text-lg text-white/80">{r.d}</p>
            <a data-btn href={r.href} className="hud-btn mt-10 inline-block">{r.cta} →</a>
          </div>
        </div>
      ))}
    </div>
  );
}

const CTA_LINES = ["The next", "evolution", "starts with a", "conversation."];

// Closing call to action: masked line reveals that then drift at different speeds, a glow that builds
// behind the heading, a drawn eyebrow rule and a magnetic button. Static under reduced motion.
function ContactCta() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        const lines = gsap.utils.toArray<HTMLElement>("[data-cta-line]");
        gsap.set("[data-cta-mask]", { clipPath: "inset(-60% -10% 0% -10%)" });

        gsap
          .timeline({ scrollTrigger: { trigger: el, start: "top 78%", end: "top 12%", scrub: 0.8 } })
          .fromTo("[data-cta-rule]", { scaleX: 0 }, { scaleX: 1, ease: "none", duration: 0.5 }, 0)
          .fromTo("[data-cta-eyebrow]", { autoAlpha: 0, x: -16 }, { autoAlpha: 1, x: 0, ease: "power2.out", duration: 0.4 }, 0.05)
          .fromTo(
            "[data-cta-word]",
            { yPercent: 120, rotate: 4 },
            { yPercent: 0, rotate: 0, ease: "power3.out", stagger: 0.12, duration: 0.7 },
            0.1,
          )
          // Widen the mask once the text has landed so the heading's glow isn't clipped.
          .to("[data-cta-mask]", { clipPath: "inset(-60% -10% -60% -10%)", ease: "none", duration: 0.15 }, 0.95)
          .fromTo("[data-cta-button]", { autoAlpha: 0, y: 30, filter: "blur(8px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", ease: "power2.out", duration: 0.5 }, 0.9);

        // After the reveal, each line drifts sideways at its own pace as the section scrolls through.
        lines.forEach((line, i) => {
          gsap.fromTo(
            line,
            { x: (i % 2 ? 1 : -1) * 3 + "vw" },
            { x: (i % 2 ? -1 : 1) * 3 + "vw", ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
          );
        });

        gsap.fromTo(
          "[data-cta-glow]",
          { scale: 0.55, opacity: 0.2, xPercent: -10 },
          { scale: 1.25, opacity: 0.55, xPercent: 12, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 } },
        );
      }, el);
      return () => ctx.revert();
    });

    // Magnetic button: pointer devices only.
    mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const zone = el.querySelector<HTMLElement>("[data-cta-magnet]");
      const btn = el.querySelector<HTMLElement>("[data-cta-button] a");
      if (!zone || !btn) return;
      const x = gsap.quickTo(btn, "x", { duration: 0.5, ease: "power3.out" });
      const y = gsap.quickTo(btn, "y", { duration: 0.5, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        const r = zone.getBoundingClientRect();
        x((e.clientX - (r.left + r.width / 2)) * 0.28);
        y((e.clientY - (r.top + r.height / 2)) * 0.4);
      };
      const leave = () => {
        x(0);
        y(0);
      };
      zone.addEventListener("pointermove", move);
      zone.addEventListener("pointerleave", leave);
      return () => {
        zone.removeEventListener("pointermove", move);
        zone.removeEventListener("pointerleave", leave);
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section id="contact" ref={root} className="relative overflow-hidden px-[6vw] py-32">
      <div
        data-cta-glow
        aria-hidden
        className="pointer-events-none absolute -right-[10vw] top-1/2 aspect-square w-[60vw] -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--primary) 38%, transparent), transparent)" }}
      />
      <div className="relative">
        <div className="mb-6 flex items-center gap-4">
          <span data-cta-rule aria-hidden className="block h-px w-16 origin-left bg-primary" />
          <p data-cta-eyebrow className="eyebrow">Let's build</p>
        </div>
        <h2 className="title-card max-w-none" aria-label="The next evolution starts with a conversation.">
          {CTA_LINES.map((line) => (
            <span key={line} aria-hidden className="block" data-cta-line>
              <span data-cta-mask className="block">
                {line.split(" ").map((w, k) => (
                  <span key={k} data-cta-word className="mr-[0.25em] inline-block will-change-transform">
                    {w}
                  </span>
                ))}
              </span>
            </span>
          ))}
        </h2>
        <div data-cta-magnet className="-m-8 mt-2 inline-block p-8">
          <div data-cta-button className="mt-2">
            <a href="mailto:hello@leadzloco.com" className="hud-btn inline-block">Start the conversation</a>
          </div>
        </div>
      </div>
    </section>
  );
}

// Looping muted clip (autoplay needs muted). Reduced-motion visitors get a paused first frame.
function AboutVideo() {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) el.pause();
    else el.play().catch(() => {});
  }, []);
  return (
    <video
      ref={video}
      src={ABOUT_VIDEO.src}
      aria-label="Darbo, founder of LeadZLoco"
      width={720}
      height={1280}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      disablePictureInPicture
      className="relative ml-auto aspect-[9/16] w-full max-w-md object-cover mix-blend-screen"
    />
  );
}

function Home() {
  return (
    <div id="home" className="relative bg-stage text-foreground">
      <section className="grid items-end gap-10 px-[6vw] pb-24 pt-10 md:grid-cols-12">
        <div className="relative z-10 md:col-span-7">
          <p className="eyebrow mb-6">Architect of Headless Agentic AI Systems</p>
          <h1 className="title-card max-w-none">Building businesses that scale without limits.</h1>
          <a href="#contact" className="hud-btn mt-10 inline-block">Start the conversation</a>
        </div>
        <div className="relative md:col-span-5">
          <div className="cine-rim absolute inset-0" />
          <AboutVideo />
        </div>
      </section>

      <section id="work" className="border-t border-border">
        <WorkRows />
      </section>

      <ContactCta />

      <footer className="flex justify-between border-t border-border px-[6vw] py-8">
        <span className="eyebrow">© LeadZLoco™</span>
        <span className="eyebrow">Technology evolves. Vision remains human.</span>
      </footer>
    </div>
  );
}
