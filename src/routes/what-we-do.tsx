import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import Lenis from "lenis";
import { Cinematic } from "@/components/what-we-do/Cinematic";
import { AfterSections } from "@/components/what-we-do/AfterSections";
import { Cursor, Nav, Preloader } from "@/components/what-we-do/Chrome";

export const Route = createFileRoute("/what-we-do")({
  head: () => ({
    meta: [
      { title: "LeadZLoco — Darbo, Architect of Headless Agentic AI Systems" },
      { name: "description", content: "Building businesses that scale without limits. A short film on the evolution of AI, then a conversation about your business." },
      { property: "og:title", content: "LeadZLoco — Building businesses that scale without limits" },
      { property: "og:description", content: "Darbo builds autonomous systems that put people first." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [finished, setFinished] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const rm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(rm);
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    const l = new Lenis({ lerp: rm ? 1 : 0.09, smoothWheel: !rm });
    let raf = 0;
    const loop = (t: number) => { l.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    setLenis(l);
    const t = setTimeout(() => setLoaded(true), 1700);
    return () => { cancelAnimationFrame(raf); clearTimeout(t); l.destroy(); };
  }, []);

  const onFinish = useCallback(() => setFinished(true), []);

  return (
    <main className="relative bg-ink text-foreground">
      <Preloader done={loaded} />
      <Cursor />
      <Nav visible={finished} />
      <Cinematic lenis={lenis} started={loaded} reduced={reduced} finished={finished} onFinish={onFinish} />
      <AfterSections />
    </main>
  );
}
