import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { WHO_WE_ARE_ASSETS as A, WHO_WE_ARE_VIDEO } from "@/cinematic/config";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/who-we-are")({
  head: () => ({
    meta: [
      { title: "Who We Are — LeadZLoco" },
      { name: "description", content: "Darbo and a tireless AI workforce, building businesses that scale without limits." },
      { property: "og:title", content: "Who We Are — LeadZLoco" },
      { property: "og:description", content: "A human gives the vision. A tireless workforce carries it out." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preload", as: "image", href: A.stage.src },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap" },
    ],
  }),
  component: WhoWeAre,
});

function WhoWeAre() {
  const root = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  // Reduced-motion visitors get a still frame instead of looping footage.
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) el.pause();
    else el.play().catch(() => {});
  }, []);

  useEffect(() => {
    let cleanup = () => {};
    let cancelled = false;

    (async () => {
      const [{ gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("lenis"),
      ]);
      if (cancelled || !root.current) return;
      gsap.registerPlugin(ScrollTrigger);

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const mobile = window.innerWidth < 768;
      const pinLength = (pct: number) => `+=${mobile ? pct * 0.7 : pct}%`;

      // Preloader: a blue line draws across, then the cover fades out.
      gsap
        .timeline()
        .fromTo("[data-pre-line]", { scaleX: 0 }, { scaleX: 1, duration: reduced ? 0.01 : 1.1, ease: "power2.inOut" })
        .to(root.current.querySelector("[data-pre]"), { autoAlpha: 0, duration: 0.5 });

      let lenis: InstanceType<typeof Lenis> | null = null;
      const tick = (t: number) => lenis?.raf(t * 1000);
      if (!reduced) {
        lenis = new Lenis({ lerp: 0.09 });
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
      }

      const onMove = (e: PointerEvent) => gsap.to(cursor.current, { x: e.clientX, y: e.clientY, duration: 0.25 });
      window.addEventListener("pointermove", onMove);

      const ctx = gsap.context(() => {
        if (reduced) {
          gsap.set("[data-reveal]", { opacity: 1, y: 0 });
          return;
        }

        // 04 — the human: slow portrait push, wireframe mesh breathes open and closed, beats stagger in.
        gsap
          .timeline({ scrollTrigger: { trigger: "#human", start: "top top", end: pinLength(100), scrub: 1.5, pin: true } })
          .fromTo("#human [data-plate]", { scale: 1 }, { scale: A.portrait.maxScale, ease: "sine.inOut" }, 0)
          .fromTo("#human [data-mesh]", { clipPath: "circle(18% at 38% 30%)", opacity: 0.4 }, { clipPath: "circle(70% at 38% 30%)", opacity: 0.9, duration: 0.5, ease: "sine.inOut" }, 0)
          .to("#human [data-mesh]", { clipPath: "circle(10% at 38% 30%)", opacity: 0.3, duration: 0.5, ease: "sine.inOut" }, 0.5)
          .fromTo("#human [data-beat]", { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.22, duration: 0.18 }, 0.1);

        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) =>
          gsap.fromTo(el, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.1, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 88%" } }),
        );
      }, root);

      cleanup = () => {
        window.removeEventListener("pointermove", onMove);
        ctx.revert();
        gsap.ticker.remove(tick);
        lenis?.destroy();
      };
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return (
    <div ref={root} className="wwa relative bg-background text-foreground">
      <div data-pre aria-hidden className="fixed inset-0 z-[80] flex items-center bg-background">
        <div data-pre-line className="h-px w-full origin-left" style={{ background: "var(--gradient-blue)" }} />
      </div>
      <div className="grain" aria-hidden />
      <div className="vignette" aria-hidden />
      <div ref={cursor} className="cursor" aria-hidden />

      <SiteHeader current="who-we-are" contactHref="#contact" />

      <main>
        <section id="banner" className="relative h-svh overflow-hidden" aria-label="Who we are">
          <h1 className="sr-only">Who we are</h1>
          <video
            ref={video}
            className="absolute inset-0 h-full w-full object-cover"
            src={WHO_WE_ARE_VIDEO.src}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden
            tabIndex={-1}
            disablePictureInPicture
          />
          <div aria-hidden className="absolute inset-x-0 top-0 h-40" style={{ background: "linear-gradient(to bottom, color-mix(in oklab, var(--background) 70%, transparent), transparent)" }} />
          <div className="plate-mask-bottom" />
        </section>

        <section id="human" className="relative h-svh overflow-hidden" aria-label="Technology evolves, vision remains human">
          <div className="absolute inset-y-0 right-0 w-full md:w-[60%]">
            <div className="plate">
              <div className="plate-img" data-plate style={{ aspectRatio: "1", transformOrigin: A.portrait.focal, height: "100svh" }}>
                <img
                  src={A.portrait.src}
                  alt="Portrait of Darbo, half his face rendered as a blue wireframe, red glasses"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full"
                />
                <svg data-mesh className="absolute inset-0 h-full w-full mix-blend-screen" viewBox="0 0 100 100" aria-hidden>
                  {Array.from({ length: 14 }, (_, i) => (
                    <line key={`h${i}`} x1="0" x2="100" y1={i * 7.5} y2={i * 7.5 + 3} stroke="var(--primary-glow)" strokeWidth=".08" />
                  ))}
                  {Array.from({ length: 14 }, (_, i) => (
                    <line key={`v${i}`} y1="0" y2="100" x1={i * 7.5} x2={i * 7.5 - 3} stroke="var(--primary-glow)" strokeWidth=".08" />
                  ))}
                </svg>
              </div>
            </div>
            <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, var(--background) 0%, transparent 35%)" }} />
          </div>
          <div className="plate-mask-bottom md:hidden" />
          <div className="absolute bottom-[8vh] left-6 max-w-lg md:bottom-auto md:left-10 md:top-1/2 md:-translate-y-1/2">
            <p className="readout mb-4">04 / The human behind it · Darbo</p>
            <h2 className="headline text-[clamp(2rem,5vw,4.6rem)]">
              Technology evolves.<br /><span className="text-blue-grad">Vision remains human.</span>
            </h2>
            <ol className="mt-8 space-y-4 border-l border-border pl-5">
              <li data-beat><span className="readout text-gold">i.</span> We lead with people. Always first, never an afterthought.</li>
              <li data-beat><span className="readout text-gold">ii.</span> We make AI plain, understandable and actually useful.</li>
              <li data-beat><span className="readout text-gold">iii.</span> We build to empower your team, not to replace it.</li>
            </ol>
          </div>
        </section>

        <section className="relative overflow-hidden px-6 py-[22vh] md:px-10" aria-label="Let's build">
          <img src={A.stage.src} alt="" aria-hidden loading="lazy" className="absolute inset-0 h-full w-full object-contain opacity-10 blur-sm" />
          <div
            aria-hidden
            className="absolute -left-1/4 top-0 h-full w-1/2 animate-pulse opacity-20"
            style={{ background: "radial-gradient(closest-side, var(--primary), transparent)", animationDuration: "9s" }}
          />
          <div className="relative max-w-4xl">
            <h2 data-reveal className="headline text-[clamp(2.4rem,7vw,6rem)]">
              Let's build something<br />that <span className="text-gold-grad">scales.</span>
            </h2>
            <div data-reveal className="mt-10 flex flex-wrap gap-4">
              <a href="#contact" className="btn-gold">Book a conversation →</a>
              <a href="/what-we-do" className="btn-line">See what we build</a>
            </div>
            <ul data-reveal className="readout mt-12 flex flex-wrap gap-x-10 gap-y-2">
              <li>— We listen first.</li>
              <li>— We start small.</li>
              <li>— People stay first.</li>
            </ul>
          </div>
        </section>

        <section id="contact" className="relative overflow-hidden" aria-label="Ready to run it">
          <img
            src={A.command.src}
            alt="Darbo and a colleague at the command center, robots alongside"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: A.command.focal }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, var(--background) 10%, color-mix(in oklab, var(--background) 75%, transparent) 60%, color-mix(in oklab, var(--background) 55%, transparent))",
            }}
          />
          <div className="relative flex min-h-svh flex-col justify-end px-6 pb-16 pt-40 md:px-10">
            <p data-reveal className="headline text-2xl">
              LeadZ<span className="text-gold-grad">Loco</span>
            </p>
            <h2 data-reveal className="headline mt-4 text-[clamp(3rem,10vw,9rem)]">
              Ready to<br />run it?
            </h2>
            <div data-reveal className="mt-10">
              <a href="mailto:hello@leadzloco.com" className="btn-gold text-base">Start building →</a>
            </div>
            <div data-reveal className="readout mt-16 grid gap-6 border-t border-border pt-6 md:grid-cols-3">
              <a href="mailto:hello@leadzloco.com" className="hover:text-foreground">hello@leadzloco.com</a>
              <div className="flex gap-6">
                <a href="#" className="hover:text-foreground">LinkedIn</a>
                <a href="#" className="hover:text-foreground">YouTube</a>
                <a href="#" className="hover:text-foreground">Instagram</a>
              </div>
              <p className="md:text-right">Building businesses that scale without limits.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="readout flex justify-between px-6 py-6 md:px-10">
        <span>© 2026 LeadZLoco</span>
        <span>Founded by Darbo</span>
      </footer>
    </div>
  );
}
