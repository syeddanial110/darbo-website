import { useMemo, useRef, type MutableRefObject, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, Line } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";

type SceneProps = { progress: MutableRefObject<number>; reduced: boolean };

const BLUE = "#2f5cff";
const ICE = "#8fd8ff";
const GOLD = "#e8b44a";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOut = (v: number) => 1 - (1 - v) ** 3;
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
// Seeded PRNG so the particle field is identical on every load.
const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 1831565813) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// ---- Chapter 1 · The Intelligence: a wireframe core that pulls five satellites in ----------------

const NODES: [number, number, number][] = [
  [3.1, 0.9, 0.2],
  [1.8, -1.5, 1.8],
  [-1.3, 1.7, 1.5],
  [-3, -0.7, -1.1],
  [0.3, 0.3, -3.1],
];
const NODES_FAR = NODES.map(([x, y, z]) => new THREE.Vector3(x * 2.6, y * 3.2 + 1.5, z * 2.2));
const NODES_NEAR = NODES.map(([x, y, z]) => new THREE.Vector3(x, y, z));
const rect = (w: number, h: number): [number, number, number][] => [
  [-w / 2, -h / 2, 0],
  [w / 2, -h / 2, 0],
  [w / 2, h / 2, 0],
  [-w / 2, h / 2, 0],
  [-w / 2, -h / 2, 0],
];

function IntelligenceScene({ progress, reduced }: SceneProps) {
  const core = useRef<THREE.Group>(null);
  const nodes = useRef<THREE.Group[]>([]);
  const nodeMats = useRef<THREE.MeshStandardMaterial[]>([]);
  const linkMats = useRef<{ opacity: number }[]>([]);
  const frame = useRef<THREE.Group>(null);
  const scan = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const u = reduced ? 0.9 : progress.current;
    const t = state.clock.elapsedTime;
    if (core.current) {
      core.current.rotation.y += delta * (0.04 + u * 0.12);
      core.current.rotation.x = -0.06 + u * 0.12;
    }
    nodes.current.forEach((g, i) => {
      if (!g) return;
      const k = easeOut(clamp01(u * 6.3 - (i + 0.7)));
      g.position.lerpVectors(NODES_FAR[i]!, NODES_NEAR[i]!, k);
      g.scale.setScalar(0.5 + k * 0.5);
      const m = nodeMats.current[i];
      if (m) {
        m.emissiveIntensity = 0.15 + k * 1.7;
        m.opacity = 0.25 + k * 0.7;
      }
      const l = linkMats.current[i];
      if (l) l.opacity = k * 0.45;
    });
    if (frame.current) {
      const k = easeOut(clamp01((u - 0.18) / 0.22));
      frame.current.visible = k > 0.02;
      frame.current.scale.setScalar(0.65 + k * 0.35);
      frame.current.traverse((o) => {
        const mat = (o as THREE.Mesh).material as { opacity?: number } | undefined;
        if (mat && "opacity" in mat) mat.opacity = k * 0.7;
      });
      if (scan.current) {
        scan.current.position.x = Math.sin(t * 1.4) * 1.3;
        (scan.current.material as THREE.MeshBasicMaterial).opacity = k * 0.35;
      }
    }
  });

  return (
    <group ref={core}>
      <mesh>
        <icosahedronGeometry args={[0.95, 1]} />
        <meshStandardMaterial
          color={BLUE}
          emissive={BLUE}
          emissiveIntensity={1.3}
          wireframe
          transparent
          opacity={0.85}
        />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.32, 0]} />
        <meshBasicMaterial color={ICE} />
      </mesh>
      {NODES.map((n, i) => (
        <group key={i}>
          <Line
            points={[[0, 0, 0], n]}
            color={ICE}
            lineWidth={0.7}
            transparent
            opacity={0}
            ref={(l) => {
              if (l) linkMats.current[i] = l.material as unknown as { opacity: number };
            }}
          />
          <group
            ref={(g) => {
              if (g) nodes.current[i] = g;
            }}
            position={NODES_FAR[i]!}
          >
            <mesh>
              <icosahedronGeometry args={[0.45, 0]} />
              <meshStandardMaterial
                ref={(m) => {
                  if (m) nodeMats.current[i] = m;
                }}
                color={i === 1 ? GOLD : BLUE}
                emissive={i === 1 ? GOLD : BLUE}
                emissiveIntensity={0.15}
                wireframe
                transparent
              />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.08, 12, 12]} />
              <meshBasicMaterial color={ICE} />
            </mesh>
          </group>
        </group>
      ))}
      <group ref={frame} position={[-4.6, 1.3, -0.8]} rotation={[0, 0.5, 0.04]} visible={false}>
        <Line points={rect(2.4, 1.5)} color={ICE} lineWidth={1} transparent opacity={0.7} />
        <Line
          points={rect(1.6, 1.1)}
          color={GOLD}
          lineWidth={1}
          transparent
          opacity={0.7}
          position={[0.5, -1.4, 0.4]}
        />
        <Line
          points={rect(1.9, 0.9)}
          color={ICE}
          lineWidth={1}
          transparent
          opacity={0.7}
          position={[-0.6, -2.5, -0.3]}
        />
        <mesh ref={scan} position={[0, -0.5, 0.1]}>
          <planeGeometry args={[0.08, 3.6]} />
          <meshBasicMaterial
            color={ICE}
            transparent
            opacity={0.3}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
      <gridHelper
        args={[28, 28, "#1d3358", "#1d3358"]}
        position={[0, -2.6, 0]}
        material-transparent
        material-opacity={0.16}
      />
    </group>
  );
}

// ---- Chapter 2 · The Growth: a scan line qualifies a field of leads ----------------------------

function GrowthScene({ progress, reduced }: SceneProps) {
  const count = useMemo(
    () => (typeof window !== "undefined" && window.innerWidth < 768 ? 650 : 1500),
    [],
  );
  const { positions, colors, matched, streamStarts } = useMemo(() => {
    const rand = mulberry32(7);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const matched = new Uint8Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rand() * 2 - 1) * 8;
      positions[i * 3 + 1] = (rand() * 2 - 1) * 4.4;
      positions[i * 3 + 2] = (rand() * 2 - 1) * 4.5;
      matched[i] = +(rand() < 0.26);
    }
    const streamStarts = Array.from({ length: 10 }, (): [number, number, number] => [
      (rand() * 2 - 1) * 7,
      (rand() * 2 - 1) * 3.6,
      (rand() * 2 - 1) * 3.5,
    ]);
    return { positions, colors, matched, streamStarts };
  }, [count]);

  const group = useRef<THREE.Group>(null);
  const colorAttr = useRef<THREE.BufferAttribute | null>(null);
  const sweep = useRef<THREE.Mesh>(null);
  const streamMats = useRef<{ opacity: number }[]>([]);
  const ring = useRef<THREE.Group>(null);
  const gold = useMemo(() => new THREE.Color(GOLD), []);
  const ice = useMemo(() => new THREE.Color(ICE), []);
  const dim = useMemo(() => new THREE.Color("#2a3a55"), []);

  useFrame((_, delta) => {
    const u = reduced ? 0.85 : progress.current;
    if (group.current) group.current.rotation.y += delta * (0.02 + u * 0.05);
    const x = -8 + clamp01(u / 0.55) * 16.2;
    const attr = colorAttr.current;
    if (attr) {
      const arr = attr.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const px = positions[i * 3]!;
        const j = i * 3;
        if (px <= x) {
          if (matched[i]) {
            arr[j] = gold.r;
            arr[j + 1] = gold.g;
            arr[j + 2] = gold.b;
          } else {
            arr[j] = ice.r * 0.8;
            arr[j + 1] = ice.g * 0.8;
            arr[j + 2] = ice.b * 0.8;
          }
        } else {
          arr[j] = dim.r;
          arr[j + 1] = dim.g;
          arr[j + 2] = dim.b;
        }
      }
      attr.needsUpdate = true;
    }
    if (sweep.current) {
      sweep.current.position.x = x;
      (sweep.current.material as THREE.MeshBasicMaterial).opacity =
        0.05 + (1 - Math.abs(x) / 8) * 0.22;
    }
    const streams = smooth(0.55, 0.78, u);
    streamMats.current.forEach((m) => {
      if (m) m.opacity = streams * 0.5;
    });
    if (ring.current) {
      const k = smooth(0.68, 0.92, u);
      ring.current.visible = k > 0.01;
      ring.current.scale.setScalar(0.6 + k * 0.4);
      ring.current.rotation.z += delta * 0.4;
    }
  });

  return (
    <group ref={group}>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
            ref={(a) => {
              if (a) colorAttr.current = a;
            }}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.085}
          vertexColors
          transparent
          opacity={0.95}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
      <mesh ref={sweep} position={[0, 0, 2]}>
        <planeGeometry args={[0.07, 10]} />
        <meshBasicMaterial
          color={ICE}
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {streamStarts.map((s, i) => (
        <Line
          key={i}
          points={[s, [6.2, 0, 0]]}
          color={i % 3 === 0 ? GOLD : ICE}
          lineWidth={0.8}
          transparent
          opacity={0}
          ref={(l) => {
            if (l) streamMats.current[i] = l.material as unknown as { opacity: number };
          }}
        />
      ))}
      <group ref={ring} position={[6.2, 0, 0]} visible={false}>
        {[1.4, 1, 0.6].map((r, i) => (
          <mesh key={r} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[r, 0.015, 8, 48]} />
            <meshBasicMaterial color={i === 1 ? GOLD : ICE} transparent opacity={0.9} />
          </mesh>
        ))}
        <mesh>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshBasicMaterial color={GOLD} />
        </mesh>
      </group>
    </group>
  );
}

// ---- Chapter 3 · The Conversation: channels orbit a hub, a waveform carries the voice ----------

const ORBIT = 3.1;
const CHANNEL_COLORS = [ICE, ICE, BLUE, ICE, GOLD];

function ConversationScene({ progress, reduced }: SceneProps) {
  const group = useRef<THREE.Group>(null);
  const orbs = useRef<THREE.Mesh[]>([]);
  const orbMats = useRef<THREE.MeshBasicMaterial[]>([]);
  const packets = useRef<THREE.Mesh[]>([]);
  const gate = useRef<THREE.Group>(null);

  const wave = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(270), 3));
    const line = new THREE.Line(
      g,
      new THREE.LineBasicMaterial({ color: ICE, transparent: true, opacity: 0.85 }),
    );
    line.frustumCulled = false;
    return line;
  }, []);
  const dashed = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 120; i++) {
      const a = (i / 120) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * 4.4, Math.sin(a) * 4.4, 0));
    }
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineDashedMaterial({
        color: ICE,
        dashSize: 0.35,
        gapSize: 0.22,
        transparent: true,
        opacity: 0.4,
      }),
    );
    line.computeLineDistances();
    line.frustumCulled = false;
    return line;
  }, []);

  useFrame((state, delta) => {
    const u = reduced ? 0.85 : progress.current;
    const t = state.clock.elapsedTime;
    if (group.current) group.current.rotation.z = u * 0.5;
    orbs.current.forEach((o, i) => {
      const a = (i / 5) * Math.PI * 2 + t * 0.12 + u * 2.4;
      const x = Math.cos(a) * ORBIT;
      const y = Math.sin(a) * ORBIT * 0.92 + Math.sin(t * 0.8 + i) * 0.18;
      o.position.set(x, y, Math.sin(a * 2) * 0.4);
      const m = orbMats.current[i];
      if (m) m.opacity = 0.55 + u * 0.45;
      const p = packets.current[i];
      if (p) {
        const e = (t * 0.3 + i * 0.41) % 1;
        p.position.set(x * (1 - e), y * (1 - e), Math.sin(a * 2) * 0.4 * (1 - e));
        (p.material as THREE.MeshBasicMaterial).opacity = 0.9 * (1 - e * 0.6);
      }
    });
    const pos = wave.geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    const n = arr.length / 3;
    for (let i = 0; i < n; i++) {
      const x = -4.6 + (i / (n - 1)) * 9.2;
      const envelope = 1 - (Math.abs(x) / 4.9) ** 2;
      arr[i * 3] = x;
      arr[i * 3 + 1] = -3 + Math.sin(x * 2.3 + t * 2.4 + u * 7) * (0.1 + u * 0.75) * envelope;
      arr[i * 3 + 2] = 0;
    }
    pos.needsUpdate = true;
    dashed.rotation.z += delta * (0.1 + u * 0.5);
    (dashed.material as THREE.LineDashedMaterial).opacity = 0.2 + u * 0.45;
    if (gate.current) {
      const k = easeOut(smooth(0.8, 0.96, u));
      gate.current.visible = k > 0.02;
      gate.current.scale.setScalar(0.4 + k * 0.6);
      gate.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <group ref={group}>
      <primitive object={dashed} />
      <primitive object={wave} />
      <mesh>
        <sphereGeometry args={[0.65, 24, 24]} />
        <meshStandardMaterial color={BLUE} emissive={BLUE} emissiveIntensity={1.1} wireframe />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshBasicMaterial color={ICE} />
      </mesh>
      {CHANNEL_COLORS.map((color, i) => (
        <group key={i}>
          <mesh
            ref={(m) => {
              if (m) orbs.current[i] = m;
            }}
          >
            <sphereGeometry args={[0.3, 18, 18]} />
            <meshBasicMaterial
              ref={(m) => {
                if (m) orbMats.current[i] = m;
              }}
              color={color}
              transparent
              opacity={0.6}
            />
          </mesh>
          <mesh
            ref={(m) => {
              if (m) packets.current[i] = m;
            }}
          >
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshBasicMaterial color={i === 4 ? GOLD : ICE} transparent opacity={0.9} />
          </mesh>
        </group>
      ))}
      <group ref={gate} position={[2.9, -2.2, 1.6]} visible={false}>
        <mesh rotation={[Math.PI / 2.4, 0, 0]}>
          <torusGeometry args={[0.55, 0.02, 8, 48]} />
          <meshBasicMaterial color={GOLD} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.09, 0.09, 0.5, 10]} />
          <meshBasicMaterial color={ICE} wireframe />
        </mesh>
        <mesh position={[0, 0.36, 0]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshBasicMaterial color={ICE} wireframe />
        </mesh>
      </group>
    </group>
  );
}

// ---- Shared stage: canvas, image-based lighting and bloom -----------------------------------

function Stage({
  reduced,
  className,
  children,
}: {
  reduced: boolean;
  className?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div data-scene-root className={className}>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 1.2, 9], fov: 45 }}
        frameloop={reduced ? "demand" : "always"}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) =>
          gl.domElement.closest("[data-scene-root]")?.setAttribute("data-scene-ready", "")
        }
      >
        {children}
        <Environment resolution={64}>
          <Lightformer intensity={1.6} position={[0, 5, 0]} scale={[10, 10, 1]} />
          <Lightformer
            intensity={0.9}
            color="#8bb8ff"
            position={[-5, 1, -1]}
            rotation-y={Math.PI / 2}
            scale={[20, 1, 1]}
          />
          <Lightformer intensity={0.5} color="#e8b44a" position={[5, -2, 2]} scale={[8, 1, 1]} />
        </Environment>
        <EffectComposer>
          <Bloom intensity={1.1} luminanceThreshold={0.2} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

export default function ChapterScene({
  id,
  progress,
  reduced,
  className,
}: SceneProps & { id: number; className?: string | undefined }) {
  return (
    <Stage reduced={reduced} className={className}>
      {id === 1 && <IntelligenceScene progress={progress} reduced={reduced} />}
      {id === 2 && <GrowthScene progress={progress} reduced={reduced} />}
      {id === 3 && <ConversationScene progress={progress} reduced={reduced} />}
    </Stage>
  );
}
