import type { ArtShape, ArtTone, ProductArt as ProductArtData } from "@/types";
import { cn } from "@/lib/utils";

/** Ilustração provisória em linha, para produtos que ainda não têm fotografia. */

const toneBg: Record<ArtTone, string> = {
  rose: "bg-rose",
  lilac: "bg-lilac",
  sky: "bg-sky",
  mint: "bg-mint",
  peach: "bg-peach",
  sand: "bg-sand",
  gold: "bg-gold-soft",
};

const INK = "#292725";
const CREAM = "#FAF9F7";
const GOLD = "#C4A878";

function Sparkle({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0 -9 L2.2 -2.2 L9 0 L2.2 2.2 L0 9 L-2.2 2.2 L-9 0 L-2.2 -2.2Z"
      fill={GOLD}
    />
  );
}

function Shape({ shape }: { shape: ArtShape }) {
  const line = { stroke: INK, strokeWidth: 1.2, strokeOpacity: 0.75, fill: CREAM } as const;
  const rib = { stroke: INK, strokeWidth: 0.8, strokeOpacity: 0.35, fill: "none" } as const;

  switch (shape) {
    case "vase":
      return (
        <g>
          <path {...line} d="M78 170 C70 130 74 100 92 84 L92 62 L108 62 L108 84 C126 100 130 130 122 170 Z" />
          <path {...rib} d="M88 100 L86 168 M96 96 L95 168 M104 96 L105 168 M112 100 L114 168" />
          <path d="M70 62 C80 40 90 36 96 30 M130 62 C124 44 112 36 106 28" stroke={INK} strokeOpacity="0.5" strokeWidth="1" fill="none" />
          <Sparkle x={106} y={26} s={0.7} />
        </g>
      );
    case "tray":
      return (
        <g>
          <path {...line} d="M30 132 C34 160 166 160 170 132 Z" />
          <ellipse {...line} cx="100" cy="128" rx="72" ry="20" />
          <ellipse {...rib} cx="100" cy="128" rx="58" ry="14" />
          <path {...rib} d="M44 140 L46 152 M70 146 L71 158 M100 148 L100 160 M130 146 L129 158 M156 140 L154 152" />
        </g>
      );
    case "candle":
      return (
        <g>
          <rect {...line} x="76" y="110" width="48" height="60" rx="8" />
          <path {...rib} d="M86 116 V166 M96 116 V166 M104 116 V166 M114 116 V166" />
          <rect {...line} x="94" y="72" width="12" height="40" rx="3" />
          <path d="M100 46 C93 56 93 63 100 68 C107 63 107 56 100 46Z" fill={GOLD} />
        </g>
      );
    case "tree":
      return (
        <g>
          <path {...line} d="M100 44 L138 100 L62 100Z" />
          <path {...line} d="M100 72 L148 130 L52 130Z" />
          <path {...line} d="M100 102 L158 162 L42 162Z" />
          <rect {...line} x="94" y="162" width="12" height="12" />
          <Sparkle x={100} y={34} s={1.1} />
        </g>
      );
    case "figure":
      return (
        <g>
          <path {...line} d="M70 170 C66 130 80 104 100 104 C120 104 134 130 130 170Z" />
          <circle {...line} cx="100" cy="86" r="16" />
          <ellipse cx="100" cy="64" rx="22" ry="5" fill="none" stroke={GOLD} strokeWidth="1.4" />
        </g>
      );
    case "family":
      return (
        <g>
          <path {...line} d="M44 170 C40 130 52 106 66 106 C80 106 92 130 88 170Z" />
          <circle {...line} cx="66" cy="90" r="12" />
          <path {...line} d="M112 170 C108 130 120 106 134 106 C148 106 160 130 156 170Z" />
          <circle {...line} cx="134" cy="90" r="12" />
          <path {...line} d="M88 170 C86 150 92 140 100 140 C108 140 114 150 112 170Z" />
          <circle {...line} cx="100" cy="130" r="7" />
          <Sparkle x={100} y={52} s={1} />
        </g>
      );
    case "kit":
      return (
        <g>
          <rect {...line} x="60" y="100" width="80" height="70" rx="4" />
          <rect {...line} x="54" y="86" width="92" height="20" rx="3" />
          <rect x="96" y="86" width="8" height="84" fill={GOLD} opacity="0.55" />
          <path {...line} d="M100 86 C80 58 66 80 100 86 C134 80 120 58 100 86Z" />
        </g>
      );
    default:
      return (
        <g fill="none" stroke={INK} strokeOpacity="0.5" strokeWidth="1">
          <circle cx="100" cy="100" r="60" />
          <circle cx="100" cy="100" r="36" />
          <circle cx="160" cy="100" r="3" fill={INK} />
          <Sparkle x={100} y={100} s={1.4} />
        </g>
      );
  }
}

export function ProductArt({
  art,
  label,
  className,
}: {
  art: ProductArtData;
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn("relative flex items-center justify-center overflow-hidden", toneBg[art.tone], className)}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      <svg viewBox="0 0 200 200" className="h-[78%] w-[78%]" aria-hidden="true" focusable="false">
        <Shape shape={art.shape} />
      </svg>
    </div>
  );
}

/** Composição maior usada em locais sem fotografia (ex.: fallback de campanhas). */
export function toneClass(tone: ArtTone): string {
  return toneBg[tone];
}
