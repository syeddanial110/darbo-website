/**
 * HOME PAGE SCENE CONFIG
 * ----------------------------------------------------------------------------
 * Every image slot is listed here. To replace a stand-in with a real pose
 * sequence, drop aligned, text-free frames at the `slots` paths (public/assets/home/...)
 * and switch `frames` to `slots`. All frames in one scene MUST share the same
 * camera, framing, scale and foot/baseline anchor so they stack exactly.
 * Darbo: bald, red-framed glasses (on every frame), black zip jacket.
 * Robot eyes glow BLUE, never red.
 */
import s1Human from "@/assets/what-we-do/s1-human.jpg";
import s1Robot from "@/assets/what-we-do/s1-robot.jpg";
import s2Command from "@/assets/what-we-do/s2-command.jpg";
import s3Holo from "@/assets/what-we-do/s3-hologram.jpg";
import s4City from "@/assets/what-we-do/s4-city.jpg";

const slots = (scene: string, n: number) =>
  Array.from({ length: n }, (_, i) => `/assets/home/${scene}-pose-${String(i + 1).padStart(2, "0")}.jpg`);

export type SceneConfig = {
  id: string;
  label: string;
  headline: string[]; // each entry = deliberate line break
  subline?: string;
  /** Final pose slots (replace stand-ins with these when supplied). */
  slots: string[];
  /** Frames currently drawn by <PoseSequence />. */
  frames: string[];
  /** Lighter set for mobile (defaults to frames). */
  mobileFrames?: string[];
  /** Noise-threshold disintegration between frames instead of crossfade. */
  dissolve?: boolean;
  /** Pinned scroll length in viewport heights. */
  scrollVh: number;
  /** Auto-scroll duration in seconds. */
  autoSeconds: number;
  /** Focal point (0-1) on subject center; used for narrow-screen fit. */
  focal: { x: number; y: number };
  /** Max push-in scale over the scene (1.06 - 1.10). */
  maxScale: number;
  /** Per-breakpoint art-directed crops (aspect the source should be cut to). */
  crops: { desktop: "16:9"; tablet: "4:3"; mobile: "4:5" | "9:16" };
  /** Where headline sits so it never covers the face. */
  textZone: "left" | "right" | "lower-left" | "lower-right";
};

export const SCENES: SceneConfig[] = [
  {
    id: "transformation",
    label: "01 Transformation",
    headline: ["THE", "EVOLUTION", "BEGINS."],
    // s1-pose-01..10: walking toward camera, human -> robot across frames
    slots: slots("s1", 10),
    frames: [s1Human, s1Robot],
    dissolve: true,
    scrollVh: 250,
    autoSeconds: 13,
    focal: { x: 0.5, y: 0.45 },
    maxScale: 1.08,
    crops: { desktop: "16:9", tablet: "4:3", mobile: "9:16" },
    textZone: "lower-left",
  },
  {
    id: "awakening",
    label: "02 Awakening",
    headline: ["THE FUTURE", "DOESN'T", "WAIT."],
    // s2-pose-01..08: robot Darbo commanding the command center
    slots: slots("s2", 8),
    frames: [s2Command],
    scrollVh: 150,
    autoSeconds: 8,
    focal: { x: 0.5, y: 0.5 },
    maxScale: 1.07,
    crops: { desktop: "16:9", tablet: "4:3", mobile: "4:5" },
    textZone: "lower-right",
  },
  {
    id: "world",
    label: "03 World",
    headline: ["WITHOUT", "LIMITS."],
    // s3-pose-01..06: translucent hologram Darbo in space
    slots: slots("s3", 6),
    frames: [s3Holo],
    scrollVh: 150,
    autoSeconds: 8,
    focal: { x: 0.5, y: 0.4 },
    maxScale: 1.06,
    crops: { desktop: "16:9", tablet: "4:3", mobile: "9:16" },
    textZone: "left",
  },
  {
    id: "ascension",
    label: "04 Ascension",
    headline: ["VISION", "REMAINS", "HUMAN."],
    // s4-pose-01..08: city platform, robot reverting to human
    slots: slots("s4", 8),
    frames: [s4City],
    scrollVh: 150,
    autoSeconds: 10,
    focal: { x: 0.3, y: 0.5 },
    maxScale: 1.08,
    crops: { desktop: "16:9", tablet: "4:3", mobile: "4:5" },
    textZone: "right",
  },
];

/** Final title card after scene 4 (extra pinned length in vh). */
export const OUTRO_VH = 80;
export const OUTRO_SECONDS = 4;
export const HEADLINE_DWELL = 0.9;
export const RESUME_AFTER_MS = 5000;
