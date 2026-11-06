import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { HeroVideo } from "@/components/HeroVideo";
import { ABOUT_VIDEO } from "@/cinematic/config";

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
  { n: "01", t: "Systems that think ahead", d: "Agentic architecture that works quietly behind your brand — wherever your customers are." },
  { n: "02", t: "Headless by design", d: "Your front end stays yours. Intelligence plugs in underneath, ready to scale." },
  { n: "03", t: "Built around people", d: "Technology evolves. The vision, the judgement and the relationships stay human." },
];

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

      <section id="work" className="border-t border-border px-[6vw] py-24">
        {ROWS.map((r, i) => (
          <div key={r.n} className={`grid gap-6 border-b border-border py-12 md:grid-cols-12 ${i % 2 ? "md:text-right" : ""}`}>
            <span className={`eyebrow md:col-span-2 ${i % 2 ? "md:order-last" : ""}`}>{r.n}</span>
            <h3 className="text-3xl font-bold md:col-span-6 md:text-5xl" style={{ fontStretch: "115%" }}>{r.t}</h3>
            <p className="text-muted-foreground md:col-span-4">{r.d}</p>
          </div>
        ))}
      </section>

      <section id="contact" className="px-[6vw] py-32">
        <p className="eyebrow mb-6">Let's build</p>
        <h2 className="title-card max-w-[14ch]">The next evolution starts with a conversation.</h2>
        <a href="mailto:hello@leadzloco.com" className="hud-btn mt-10 inline-block">Start the conversation</a>
      </section>

      <footer className="flex justify-between border-t border-border px-[6vw] py-8">
        <span className="eyebrow">© LeadZLoco™</span>
        <span className="eyebrow">Technology evolves. Vision remains human.</span>
      </footer>
    </div>
  );
}
