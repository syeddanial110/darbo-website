import type { ReactNode, SVGProps } from "react";
import type { IconKey } from "./data";

const Svg = ({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.4}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...props}
  >
    {children}
  </svg>
);

const dot = (cx: number, cy: number, r: number) => (
  <circle cx={cx} cy={cy} r={r} fill="currentColor" stroke="none" />
);

const ICONS: Record<IconKey, (p: SVGProps<SVGSVGElement>) => ReactNode> = {
  agentic: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="2.4" />
      <circle cx="12" cy="4" r="1.2" />
      <circle cx="19" cy="16" r="1.2" />
      <circle cx="5" cy="16" r="1.2" />
      <path d="M12 6.2v3.4M17.8 15.2l-3.6-1.6M6.2 15.2l3.6-1.6" />
    </Svg>
  ),
  headless: (p) => (
    <Svg {...p}>
      <rect x="3" y="4" width="10" height="8" rx="1" />
      <rect x="11" y="9" width="10" height="7" rx="1" />
      <rect x="5" y="14" width="9" height="6" rx="1" />
      <path d="M13 6h4" strokeOpacity="0.6" />
    </Svg>
  ),
  architecture: (p) => (
    <Svg {...p}>
      <path d="M3 20h18M6 20V9m6 11V4m6 16v-8" />
      {dot(12, 4, 1.1)}
      {dot(6, 9, 1.1)}
      {dot(18, 12, 1.1)}
    </Svg>
  ),
  bi: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4.5" strokeOpacity="0.6" />
      {dot(12, 12, 1.2)}
      <path d="M12 4v3M20 12h-3" />
    </Svg>
  ),
  database: (p) => (
    <Svg {...p}>
      <ellipse cx="12" cy="5.5" rx="7" ry="2.5" />
      <path d="M5 5.5v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6M5 11.5v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6" />
      {dot(17, 16, 1)}
    </Svg>
  ),
  sales: (p) => (
    <Svg {...p}>
      <path d="M3 18c5 0 5-12 10-12h6" />
      <path d="M16 3l3 3-3 3" />
      {dot(4, 18, 1.2)}
    </Svg>
  ),
  discovery: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="8" strokeOpacity="0.5" />
      <path d="M12 12L18 6" />
      <path d="M12 4a8 8 0 0 1 8 8" />
      {dot(15.5, 14.5, 1.2)}
      {dot(9, 8.5, 1.2)}
    </Svg>
  ),
  matching: (p) => (
    <Svg {...p}>
      <path d="M3 7c5 0 6 5 9 5s4-5 9-5" />
      <path d="M3 17c5 0 6-5 9-5s4 5 9 5" />
      {dot(12, 12, 1.4)}
    </Svg>
  ),
  social: (p) => (
    <Svg {...p}>
      <circle cx="5" cy="6" r="1.4" />
      <circle cx="18" cy="5" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="7" cy="18" r="1.4" />
      <circle cx="19" cy="17" r="1.4" />
      <path
        d="M6.2 6.8 10.8 11M16.6 5.7 13 11.2M8 17.2l3.2-4M18 15.8l-4.6-2.7"
        strokeOpacity="0.7"
      />
    </Svg>
  ),
  recovery: (p) => (
    <Svg {...p}>
      <path d="M20 12a8 8 0 1 1-2.3-5.6" />
      <path d="M18 3v4h-4" />
      {dot(12, 12, 1.3)}
    </Svg>
  ),
  multichannel: (p) => (
    <Svg {...p}>
      {dot(12, 12, 1.6)}
      <path
        d="M12 10.4V4M12 13.6V20M10.4 12H4M13.6 12H20M10.9 10.9 6.5 6.5M13.1 13.1l4.4 4.4M13.1 10.9l4.4-4.4M10.9 13.1l-4.4 4.4"
        strokeOpacity="0.6"
      />
    </Svg>
  ),
  voice: (p) => (
    <Svg {...p}>
      <path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 11v2" />
    </Svg>
  ),
  engagement: (p) => (
    <Svg {...p}>
      <path d="M4 5h16v10H9l-5 4z" />
      {dot(9, 10, 0.9)}
      {dot(13, 10, 0.9)}
      {dot(17, 10, 0.9)}
    </Svg>
  ),
  followup: (p) => (
    <Svg {...p}>
      <path d="M7 12a5 5 0 1 1 5 5H8" />
      <path d="M11 20l-3-3 3-3" />
      {dot(12, 7, 1.1)}
    </Svg>
  ),
  scheduling: (p) => (
    <Svg {...p}>
      <rect x="3.5" y="5" width="17" height="15" rx="1.5" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
      <path d="M9 14l2 2 4-4" />
    </Svg>
  ),
  workforce: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="7" r="2" />
      <path d="M8 16c0-2.2 1.8-4 4-4s4 1.8 4 4" />
      <circle cx="5" cy="9" r="1.5" strokeOpacity="0.6" />
      <circle cx="19" cy="9" r="1.5" strokeOpacity="0.6" />
      <path d="M2.5 16c0-1.4 1.1-2.5 2.5-2.5M21.5 16c0-1.4-1.1-2.5-2.5-2.5" strokeOpacity="0.6" />
    </Svg>
  ),
  onboarding: (p) => (
    <Svg {...p}>
      <path d="M4 20v-4h4v4M10 20v-8h4v8M16 20v-12h4v12" />
    </Svg>
  ),
  training: (p) => (
    <Svg {...p}>
      <path d="M4 19h16" />
      <path d="M7 19v-5M12 19V9M17 19v-8" strokeOpacity="0.6" />
      <path d="M5 8l5-4 5 3 4-5" />
    </Svg>
  ),
  ops: (p) => (
    <Svg {...p}>
      <rect x="3" y="4" width="7" height="7" rx="1" />
      <rect x="14" y="13" width="7" height="7" rx="1" />
      <path d="M10 7.5h5a2 2 0 0 1 2 2V13M14 16.5H9a2 2 0 0 1-2-2V11" strokeOpacity="0.7" />
    </Svg>
  ),
  infrastructure: (p) => (
    <Svg {...p}>
      <path d="M4 21V8l5-3v16M9 21V11l6-3v13M15 21h5v-8l-5-3" />
      <path d="M2 21h20" />
    </Svg>
  ),
};

export function ServiceIcon({ icon, ...props }: { icon: IconKey } & SVGProps<SVGSVGElement>) {
  return <>{ICONS[icon](props)}</>;
}
