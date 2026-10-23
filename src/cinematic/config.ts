// Single source of truth for site imagery. Swap files here without touching page code.
import darboHuman from "@/assets/darbo-human-matched.png";
import wwaStage from "@/assets/who-we-are/stage-darbo-full.jpg";
import wwaCallcenter from "@/assets/who-we-are/robot-callcenter.jpg";
import wwaHandoff from "@/assets/who-we-are/robots-handoff.jpg";
import wwaPortrait from "@/assets/who-we-are/darbo-portrait.jpg";
import wwaCommand from "@/assets/who-we-are/command-center.jpg";

export const CINEMATIC_ASSETS = {
  darboHuman,
};

// "Who we are" page plates. aspect = source image ratio, focal = transform-origin for scroll zooms.
export const WHO_WE_ARE_ASSETS = {
  stage: { src: wwaStage, aspect: 1376 / 768, focal: "51% 46%", maxScale: 1.08 },
  callcenter: { src: wwaCallcenter, aspect: 1376 / 768, focal: "50% 55%", maxScale: 1.06 },
  handoff: { src: wwaHandoff, aspect: 4 / 3, focal: "55% 45%", maxScale: 1.06 },
  portrait: { src: wwaPortrait, aspect: 1, focal: "48% 35%", maxScale: 1.06 },
  command: { src: wwaCommand, aspect: 1152 / 928, focal: "50% 40%", maxScale: 1.05 },
  parallaxMax: 3.5,
};

export const HERO_VIDEO = {
  src: "/videos/hero.mp4",
  poster: "/videos/hero-poster.jpg",
};
