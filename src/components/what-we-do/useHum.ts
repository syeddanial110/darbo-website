import { useEffect, useRef } from "react";

/** Low mechanical hum + deep pulse. Off by default, volume tied to progress. */
export function useHum(on: boolean, progress: number, playing: boolean) {
  const nodes = useRef<{ ctx: AudioContext; gain: GainNode } | null>(null);

  useEffect(() => {
    if (!on) {
      nodes.current?.ctx.close();
      nodes.current = null;
      return;
    }
    const ctx = new AudioContext();
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(ctx.destination);
    const hum = ctx.createOscillator();
    hum.type = "sawtooth";
    hum.frequency.value = 52;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 180;
    hum.connect(lp).connect(gain);
    const pulse = ctx.createOscillator();
    pulse.frequency.value = 38;
    const pg = ctx.createGain();
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.8;
    const lg = ctx.createGain();
    lg.gain.value = 0.5;
    lfo.connect(lg).connect(pg.gain);
    pulse.connect(pg).connect(gain);
    [hum, pulse, lfo].forEach((o) => o.start());
    nodes.current = { ctx, gain };
    return () => {
      ctx.close();
      nodes.current = null;
    };
  }, [on]);

  useEffect(() => {
    const n = nodes.current;
    if (!n) return;
    const target = playing ? 0.04 + progress * 0.08 : 0.015;
    n.gain.gain.setTargetAtTime(target, n.ctx.currentTime, 0.3);
  }, [progress, playing, on]);
}
