import { useEffect, useRef } from "react";

type Props = {
  frames: string[];
  /** 0..1 scene progress — the single source of truth. */
  progress: number;
  dissolve?: boolean;
  hologram?: boolean;
  scale?: number;
  focalX?: number;
  className?: string;
  label: string;
};

type Particle = { x: number; y: number; vx: number; vy: number; life: number; size: number };

/**
 * Canvas pose player. Picks frame from progress, blends neighbours with a
 * crossfade + ghost trail, or a noise-threshold disintegration with particles.
 * Image is sized to viewport height first; sides get a blurred extension.
 */
export function PoseSequence({ frames, progress, dissolve, hologram, scale = 1, focalX = 0.5, className, label }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bitmaps = useRef<(ImageBitmap | HTMLImageElement | null)[]>([]);
  const noise = useRef<HTMLCanvasElement | null>(null);
  const particles = useRef<Particle[]>([]);
  const state = useRef({ progress, scale });
  state.current = { progress, scale };

  // progressive load: first frame first
  useEffect(() => {
    let alive = true;
    bitmaps.current = frames.map(() => null);
    frames.forEach((src, i) => {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
      img.onload = async () => {
        if (!alive) return;
        try {
          bitmaps.current[i] = "createImageBitmap" in window ? await createImageBitmap(img) : img;
        } catch {
          bitmaps.current[i] = img;
        }
      };
    });
    return () => {
      alive = false;
    };
  }, [frames]);

  useEffect(() => {
    // value-noise texture used as dissolve threshold
    const n = document.createElement("canvas");
    n.width = 160;
    n.height = 90;
    const c = n.getContext("2d")!;
    const g = c.createImageData(160, 90);
    const grid = Array.from({ length: 11 * 7 }, () => Math.random());
    for (let y = 0; y < 90; y++)
      for (let x = 0; x < 160; x++) {
        const gx = x / 16, gy = y / 15;
        const x0 = Math.floor(gx), y0 = Math.floor(gy);
        const fx = gx - x0, fy = gy - y0;
        const v = (a: number, b: number) => grid[(b % 7) * 11 + (a % 11)] ?? 0;
        const top = v(x0, y0) * (1 - fx) + v(x0 + 1, y0) * fx;
        const bot = v(x0, y0 + 1) * (1 - fx) + v(x0 + 1, y0 + 1) * fx;
        // bias: upper body / hands dissolve before feet
        const val = (top * (1 - fy) + bot * fy) * 0.7 + (y / 90) * 0.3 + (Math.random() - 0.5) * 0.06;
        const i = (y * 160 + x) * 4;
        g.data[i] = g.data[i + 1] = g.data[i + 2] = 255;
        g.data[i + 3] = Math.max(0, Math.min(255, val * 255));
      }
    c.putImageData(g, 0, 0);
    noise.current = n;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const mask = document.createElement("canvas");
    const mctx = mask.getContext("2d")!;
    let raf = 0;
    const mobile = window.matchMedia("(max-width: 768px)").matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      mask.width = canvas.width;
      mask.height = canvas.height;
    };
    resize();
    window.addEventListener("resize", resize);

    const place = (img: ImageBitmap | HTMLImageElement, s: number) => {
      const W = canvas.width, H = canvas.height;
      const iw = img.width, ih = img.height;
      // height-first; on narrow screens fit width but keep focal centered
      let h = H, w = (iw / ih) * h;
      if (W / H < 0.9) {
        const minW = W * 1.8;
        if (w < minW) { w = minW; h = (ih / iw) * w; }
      }
      w *= s; h *= s;
      const x = W / H < 0.9 ? W / 2 - w * focalX : (W - w) / 2;
      return { x, y: (H - h) / 2, w, h };
    };

    const drawFrame = (target: CanvasRenderingContext2D, img: ImageBitmap | HTMLImageElement, s: number, alpha = 1, dx = 0) => {
      const r = place(img, s);
      target.globalAlpha = alpha;
      target.drawImage(img, r.x + dx, r.y, r.w, r.h);
      target.globalAlpha = 1;
      return r;
    };

    const loop = () => {
      const { progress: p, scale: s } = state.current;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const list = bitmaps.current;
      const first = list.find(Boolean);
      if (first) {
        // blurred side extension
        ctx.save();
        ctx.filter = "blur(40px) brightness(0.45)";
        ctx.drawImage(first, -W * 0.1, -H * 0.1, W * 1.2, H * 1.2);
        ctx.restore();

        if (hologram) ctx.filter = "grayscale(1) sepia(1) hue-rotate(170deg) saturate(4) brightness(1.1)";
        const f = Math.max(0, Math.min(1, p)) * (frames.length - 1);
        const i0 = Math.floor(f), i1 = Math.min(frames.length - 1, i0 + 1);
        const t = f - i0;
        const a = list[i0] || first, b = list[i1] || a;

        if (dissolve && a !== b && t > 0 && noise.current) {
          // draw target, then source masked by noise threshold
          const r = drawFrame(ctx, b, s);
          mctx.clearRect(0, 0, W, H);
          drawFrame(mctx, a, s);
          mctx.globalCompositeOperation = "destination-in";
          // threshold via contrast-boosted noise
          mctx.filter = `contrast(12) brightness(${1.6 - t * 2.2})`;
          mctx.drawImage(noise.current, r.x, r.y, r.w, r.h);
          mctx.filter = "none";
          mctx.globalCompositeOperation = "source-over";
          ctx.drawImage(mask, 0, 0);
          // particles peak mid-transformation
          const density = Math.sin(t * Math.PI);
          const spawn = Math.floor(density * (mobile ? 6 : 18));
          for (let k = 0; k < spawn; k++)
            particles.current.push({
              x: r.x + r.w * (0.4 + Math.random() * 0.2),
              y: r.y + r.h * (0.05 + Math.random() * 0.6),
              vx: (Math.random() - 0.3) * 2.2,
              vy: -Math.random() * 1.6 - 0.2,
              life: 1,
              size: Math.random() * 2.4 + 0.6,
            });
        } else {
          // crossfade + ghost trail + 1-2px displacement
          drawFrame(ctx, a, s, 1);
          if (a !== b && t > 0) {
            drawFrame(ctx, a, s, 0.18 * (1 - t), -2);
            drawFrame(ctx, b, s, t, 1.5 * (1 - t));
          }
        }
        ctx.filter = "none";
      }

      // particles: embers / ash
      const ps = particles.current;
      for (let k = ps.length - 1; k >= 0; k--) {
        const q = ps[k]!;
        q.x += q.vx; q.y += q.vy; q.vy -= 0.01; q.life -= 0.012;
        if (q.life <= 0) { ps.splice(k, 1); continue; }
        ctx.fillStyle = k % 3 ? `rgba(79,195,255,${q.life})` : `rgba(255,216,77,${q.life * 0.8})`;
        ctx.fillRect(q.x, q.y, q.size, q.size);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [frames, dissolve, hologram, focalX]);

  return <canvas ref={canvasRef} role="img" aria-label={label} className={className} />;
}
