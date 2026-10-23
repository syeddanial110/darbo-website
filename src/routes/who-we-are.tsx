import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { WHO_WE_ARE_ASSETS as A } from "@/cinematic/config";

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

// Robot stations (percent of the call-center plate) and the hub their links converge on.
const STATIONS: [number, number][] = [[14, 56], [24, 59], [34, 57], [39.5, 55], [50, 55], [60, 55], [64.5, 57], [76, 59], [86, 56], [49.8, 60]];
const HUB: [number, number] = [50, 34];

const COUNTERS: [string, number][] = [["Tasks completed", 48210], ["Conversations handled", 12640], ["Hours worked", 8760]];

// Full-bleed image: blurred extension fills the frame, sharp plate sits centred with side fades and a blue grade.
function Plate({ src, aspect, focal, alt, eager, children }: { src: string; aspect: number; focal: string; alt: string; eager?: boolean; children?: ReactNode }) {
  const loading = eager ? "eager" : "lazy";
  return (
    <div className="plate">
      <img src={src} alt="" aria-hidden className="plate-ext" loading={loading} />
      <div className="plate-img wide" style={{ aspectRatio: String(aspect), transformOrigin: focal }} data-plate>
        <img src={src} alt={alt} className="absolute inset-0 h-full w-full" loading={loading} />
        {children}
      </div>
      <div className="plate-mask-sides" />
      <div className="grade" />
    </div>
  );
}

function WhoWeAre() {
  const root = useRef<HTMLDivElement>(null);
  const particles = useRef<HTMLCanvasElement>(null);
  const cursor = useRef<HTMLDivElement>(null);

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

        // 01 — the voice: stage plate sharpens and pushes in, spotlight opens, second line arrives.
        gsap
          .timeline({ scrollTrigger: { trigger: "#voice", start: "top top", end: pinLength(140), scrub: 1.2, pin: true } })
          .fromTo("#voice [data-plate]", { scale: 1, filter: "blur(2.5px) brightness(.8)" }, { scale: A.stage.maxScale, filter: "blur(0px) brightness(1)", ease: "none" }, 0)
          .fromTo("#voice [data-spot]", { opacity: 0.55, "--r": "34%" }, { opacity: 0.15, "--r": "60%", ease: "none" }, 0)
          .fromTo("#voice [data-crowd]", { yPercent: 0 }, { yPercent: -A.parallaxMax, ease: "none" }, 0)
          .fromTo("#voice [data-l1]", { y: 0 }, { y: -20, duration: 0.5 }, 0)
          .fromTo("#voice [data-l2]", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.25 }, 0.45)
          .to("#voice [data-flare]", { opacity: 0.8, x: "6vw", duration: 0.4 }, 0.4);

        // 02 — the workforce: plate wipes in, links and rings light up, counters run with progress.
        const counters = gsap.utils.toArray<HTMLElement>("[data-count]");
        gsap
          .timeline({
            scrollTrigger: {
              trigger: "#workforce",
              start: "top top",
              end: pinLength(140),
              scrub: 0.6,
              pin: true,
              onUpdate: (self) => counters.forEach((el) => {
                el.textContent = Math.round(Number(el.dataset["count"]) * self.progress).toLocaleString("en-US");
              }),
            },
          })
          .fromTo("#workforce [data-beam]", { xPercent: -120, opacity: 0.9 }, { xPercent: 120, opacity: 0.4, ease: "none", duration: 0.5 }, 0)
          .fromTo("#workforce [data-plate]", { clipPath: "inset(0 100% 0 0)", x: "-1.5%", scale: 1.04 }, { clipPath: "inset(0 0% 0 0)", duration: 0.45, ease: "none" }, 0)
          .to("#workforce [data-plate]", { x: "1.5%", scale: A.callcenter.maxScale, ease: "none", duration: 1 }, 0)
          .fromTo("#workforce [data-link]", { strokeDashoffset: 1 }, { strokeDashoffset: 0, stagger: 0.03, duration: 0.3 }, 0.3)
          .fromTo("#workforce [data-ring]", { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, stagger: 0.04, duration: 0.15, transformOrigin: "center", ease: "power1.out" }, 0.35)
          .fromTo("#workforce [data-copy]", { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.2 }, 0.15);

        // 03 — the connection: seam splits stage and workforce, a stream links them, the hand-off detail opens.
        gsap
          .timeline({ scrollTrigger: { trigger: "#connection", start: "top top", end: pinLength(120), scrub: 0.9, pin: true } })
          .fromTo("#connection [data-seam]", { scaleY: 0 }, { scaleY: 1, duration: 0.15 }, 0)
          .fromTo("#connection [data-stream]", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.35, ease: "power2.inOut" }, 0.1)
          .to("#connection [data-left]", { clipPath: "inset(0 0% 0 0)", duration: 0.3 }, 0.45)
          .to("#connection [data-right]", { opacity: 0.55, duration: 0.3 }, 0.45)
          .to("#connection [data-seam]", { opacity: 0, scaleX: 8, duration: 0.2 }, 0.5)
          .fromTo("#connection [data-detail]", { clipPath: "inset(50% 49.5% 50% 49.5%)" }, { clipPath: "inset(18% 22% 18% 22%)", duration: 0.35, ease: "power3.out" }, 0.55)
          .fromTo("#connection [data-line]", { opacity: 0, y: 24 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.15 }, 0.15);

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

      // Data particles travelling from each station to the hub.
      const canvas = particles.current!;
      const g = canvas.getContext("2d")!;
      const dots = Array.from({ length: 40 }, (_, i) => ({ station: i % STATIONS.length, t: Math.random() }));
      let raf = 0;
      const draw = () => {
        const r = canvas.getBoundingClientRect();
        if (canvas.width !== r.width) {
          canvas.width = r.width;
          canvas.height = r.height;
        }
        g.clearRect(0, 0, canvas.width, canvas.height);
        if (Number(getComputedStyle(canvas).opacity) > 0.01) {
          dots.forEach((d) => {
            d.t = (d.t + 0.004) % 1;
            const [sx, sy] = STATIONS[d.station]!;
            const x = ((sx + (HUB[0] - sx) * d.t) / 100) * canvas.width;
            const y = ((sy + (HUB[1] - sy) * d.t) / 100) * canvas.height;
            g.fillStyle = `oklch(0.85 0.12 230 / ${0.9 * Math.sin(d.t * Math.PI)})`;
            g.fillRect(x, y, 2, 2);
          });
        }
        raf = requestAnimationFrame(draw);
      };
      if (!reduced) draw();

      cleanup = () => {
        cancelAnimationFrame(raf);
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

      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-5 md:px-10">
        <a href="/" className="headline text-xl" aria-label="LeadZLoco home">
          LeadZ<span className="text-gold-grad">Loco</span>
        </a>
        <nav className="readout hidden gap-8 md:flex" aria-label="Main">
          <a href="#voice" className="hover:text-foreground">Who we are</a>
          <a href="#workforce" className="hover:text-foreground">What we build</a>
          <a href="#contact" className="hover:text-foreground">Contact</a>
        </nav>
      </header>

      <main>
        <section id="voice" className="relative h-svh overflow-hidden" aria-label="We start with people">
          <Plate src={A.stage.src} aspect={A.stage.aspect} focal={A.stage.focal} alt="Darbo on stage speaking to an audience in front of blue screens" eager>
            <img data-crowd src={A.stage.src} alt="" aria-hidden className="absolute inset-0 h-full w-full" style={{ clipPath: "inset(76% 0 0 0)", filter: "brightness(.7)" }} />
          </Plate>
          <div
            data-spot
            aria-hidden
            className="absolute inset-0"
            style={{ "--r": "34%", background: "radial-gradient(circle var(--r) at 50% 45%, transparent 0%, var(--background) 100%)" } as CSSProperties}
          />
          <div data-flare aria-hidden className="absolute left-[38%] top-[10%] h-[40vh] w-[2px] opacity-0 blur-[2px]" style={{ background: "var(--gradient-blue)" }} />
          <div className="plate-mask-bottom" />
          <div className="absolute bottom-[8vh] left-6 max-w-[34rem] md:left-10">
            <p className="readout mb-4">01 / The voice · 34.05°N 118.24°W</p>
            <h1 data-l1 className="headline text-[clamp(2.6rem,7vw,6.5rem)]">
              We start<br />with <span className="text-blue-grad">people.</span>
            </h1>
            <p data-l2 className="mt-5 max-w-sm text-lg text-muted-foreground">Every system we build begins with a human with a vision.</p>
          </div>
        </section>

        <section id="workforce" className="relative h-svh overflow-hidden" aria-label="A workforce that never stops">
          <Plate src={A.callcenter.src} aspect={A.callcenter.aspect} focal={A.callcenter.focal} alt="Rows of robots working at stations like a call center">
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
              {STATIONS.map(([x, y], i) => (
                <line key={i} data-link x1={x} y1={y} x2={HUB[0]} y2={HUB[1]} pathLength={1} strokeDasharray="1" stroke="var(--primary-glow)" strokeWidth="0.12" opacity=".6" />
              ))}
            </svg>
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 56" preserveAspectRatio="none" aria-hidden>
              {STATIONS.map(([x, y], i) => (
                <ellipse key={i} data-ring cx={x} cy={y * 0.56 + 3.2} rx="1.6" ry=".9" fill="none" stroke="var(--gold)" strokeWidth=".18" />
              ))}
            </svg>
            <canvas ref={particles} className="absolute inset-0 h-full w-full" aria-hidden />
          </Plate>
          <div
            data-beam
            aria-hidden
            className="absolute inset-y-0 left-1/2 w-[30vw] -skew-x-12 mix-blend-screen"
            style={{ background: "linear-gradient(90deg, transparent, color-mix(in oklab, var(--primary-glow) 35%, transparent), transparent)" }}
          />
          <div className="plate-mask-bottom" />
          <div data-copy className="absolute bottom-[8vh] left-6 right-6 flex flex-col gap-8 md:left-10 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="readout mb-4">02 / The workforce</p>
              <h2 className="headline text-[clamp(2.2rem,6vw,5.5rem)]">
                And a workforce<br />that <span className="text-gold-grad">never stops.</span>
              </h2>
            </div>
            <dl className="grid grid-cols-3 gap-6 border-t border-border pt-4 md:gap-10">
              {COUNTERS.map(([label, n]) => (
                <div key={label}>
                  <dd className="font-mono text-xl md:text-3xl" data-count={n}>0</dd>
                  <dt className="readout mt-1 text-[0.6rem]">{label}</dt>
                </div>
              ))}
            </dl>
          </div>
          <p className="readout absolute right-6 top-24 md:right-10">live counter · illustrative</p>
        </section>

        <section id="connection" className="relative h-svh overflow-hidden" aria-label="Vision in, results out">
          <div data-right className="absolute inset-0">
            <Plate src={A.callcenter.src} aspect={A.callcenter.aspect} focal={A.callcenter.focal} alt="" />
          </div>
          <div data-left className="absolute inset-0" style={{ clipPath: "inset(0 50% 0 0)" }}>
            <Plate src={A.stage.src} aspect={A.stage.aspect} focal={A.stage.focal} alt="Darbo extending an open hand" />
          </div>
          <div
            data-seam
            aria-hidden
            className="absolute inset-y-0 left-1/2 w-px origin-center"
            style={{ background: "var(--primary-glow)", boxShadow: "0 0 24px var(--primary-glow)" }}
          />
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            <path data-stream d="M 54 45 C 62 40, 66 60, 80 55" pathLength={1} strokeDasharray="1" fill="none" stroke="var(--gold-glow)" strokeWidth=".35" />
          </svg>
          <figure data-detail className="absolute inset-0" style={{ clipPath: "inset(50% 49.5% 50% 49.5%)" }}>
            <img
              src={A.handoff.src}
              alt="A human hand passing a thread of light to a robot hand"
              loading="lazy"
              className="h-full w-full object-cover"
              style={{ objectPosition: A.handoff.focal }}
            />
          </figure>
          <div className="plate-mask-bottom" />
          <div className="absolute right-6 top-24 max-w-md text-right md:right-10">
            <p className="readout mb-4">03 / The connection</p>
            <h2 className="headline text-[clamp(2.2rem,6vw,5.5rem)]">
              Vision in.<br /><span className="text-blue-grad">Results out.</span>
            </h2>
          </div>
          <div className="absolute bottom-[8vh] left-6 space-y-1 text-xl md:left-10 md:text-2xl">
            <p data-line>He sets the direction.</p>
            <p data-line>They carry it out.</p>
            <p data-line className="text-gold-grad">Nothing slows down.</p>
          </div>
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
              <a href="#workforce" className="btn-line">See what we build</a>
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
