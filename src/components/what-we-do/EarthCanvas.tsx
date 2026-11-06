import { useEffect, useRef } from "react";

/** Lightweight dotted globe with city lights, orbit ring and arcs drawn by progress. */
const CITIES: [number, number][] = [
  [40.7, -74], [51.5, -0.1], [35.7, 139.7], [-33.9, 151.2], [1.35, 103.8], [19.4, -99.1],
  [-23.5, -46.6], [25.2, 55.3], [48.9, 2.35], [37.8, -122.4], [6.5, 3.4], [28.6, 77.2], [-26.2, 28],
];
const ARCS: [number, number][] = [[0, 1], [1, 7], [7, 11], [11, 4], [4, 2], [2, 9], [9, 5], [5, 6], [6, 10], [10, 12], [12, 3], [8, 0]];

export function EarthCanvas({ progress, className }: { progress: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const p = useRef(progress);
  p.current = progress;

  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    const mobile = window.matchMedia("(max-width: 768px)").matches;
    const dots: [number, number][] = [];
    const N = mobile ? 900 : 2200;
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      dots.push([Math.asin(y), (i * 2.39996) % (Math.PI * 2)]);
    }
    const stars: [number, number, number][] = Array.from({ length: mobile ? 120 : 260 }, () => [Math.random(), Math.random(), Math.random()]);
    let raf = 0;
    const resize = () => {
      const d = Math.min(devicePixelRatio, 2);
      c.width = c.clientWidth * d;
      c.height = c.clientHeight * d;
    };
    resize();
    addEventListener("resize", resize);
    const toRad = (v: number) => (v * Math.PI) / 180;

    const loop = (time: number) => {
      const pr = p.current;
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);
      // star parallax
      for (const [x, y, z] of stars) {
        ctx.fillStyle = `rgba(255,255,255,${0.2 + z * 0.6})`;
        ctx.fillRect(((x + pr * 0.05 * z) % 1) * W, y * H, z * 1.6 + 0.4, z * 1.6 + 0.4);
      }
      // camera pulls back: globe grows from big to framed
      const R = Math.min(W, H) * (0.62 - pr * 0.22) * (mobile ? 1.15 : 1);
      const cx = W * (mobile ? 0.5 : 0.62), cy = H * 0.55;
      const rot = time * 0.00004 + pr * 1.4;

      const atm = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.25);
      atm.addColorStop(0, "rgba(79,195,255,0.28)");
      atm.addColorStop(1, "rgba(79,195,255,0)");
      ctx.fillStyle = atm;
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.25, 0, 7); ctx.fill();
      ctx.fillStyle = "#05070D";
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();

      const proj = (lat: number, lon: number) => {
        const l = lon + rot;
        const x = Math.cos(lat) * Math.sin(l), y = Math.sin(lat), z = Math.cos(lat) * Math.cos(l);
        return { x: cx + x * R, y: cy - y * R, z };
      };
      for (const [lat, lon] of dots) {
        const q = proj(lat, lon);
        if (q.z < 0) continue;
        ctx.fillStyle = `rgba(30,107,255,${0.15 + q.z * 0.45})`;
        ctx.fillRect(q.x, q.y, 1.6, 1.6);
      }
      const pts = CITIES.map(([a, b]) => proj(toRad(a), toRad(b)));
      pts.forEach((q) => {
        if (q.z < 0) return;
        ctx.fillStyle = `rgba(255,216,77,${0.5 + q.z * 0.5})`;
        ctx.beginPath(); ctx.arc(q.x, q.y, 2.4, 0, 7); ctx.fill();
      });
      // arcs, line progress tied to scroll
      const draw = Math.max(0, (pr - 0.15) / 0.7) * ARCS.length;
      ARCS.forEach(([i, j], k) => {
        const amt = Math.max(0, Math.min(1, draw - k));
        if (!amt) return;
        const A = pts[i]!, B = pts[j]!;
        if (A.z < -0.1 && B.z < -0.1) return;
        const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
        const dx = mx - cx, dy = my - cy, d = Math.hypot(dx, dy) || 1;
        const lift = R * 0.35;
        const qx = mx + (dx / d) * lift, qy = my + (dy / d) * lift;
        ctx.strokeStyle = "rgba(79,195,255,0.85)";
        ctx.lineWidth = 1.2 * (devicePixelRatio > 1 ? 1.5 : 1);
        ctx.beginPath();
        const steps = 30;
        for (let s = 0; s <= steps * amt; s++) {
          const t = s / steps;
          const x = (1 - t) ** 2 * A.x + 2 * (1 - t) * t * qx + t * t * B.x;
          const y = (1 - t) ** 2 * A.y + 2 * (1 - t) * t * qy + t * t * B.y;
          s ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke();
      });
      // orbit ring
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(cx, cy, R * 1.45, R * 0.32, -0.25, 0, 7); ctx.stroke();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={ref} aria-hidden className={className} />;
}
