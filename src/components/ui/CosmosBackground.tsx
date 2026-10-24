import { cn } from "@/lib/utils";

/**
 * Fundo celestial da Astria em vetor (SVG): nuvens pastel, órbitas, luas,
 * planetas e estrelas de quatro pontas. Nítido em qualquer tela e sem
 * arquivos de imagem. Decorativo (aria-hidden). Pensado para ocupar um
 * bloco inteiro (use dentro de um contêiner `relative`).
 */

const C = {
  pink: "#f4c3cf",
  lilac: "#d6c9ec",
  sage: "#cfe2d4",
  gold: "#d78c42",
  rose: "#e59ab0",
  violet: "#a99bd3",
  sky: "#8fc6d8",
  mauve: "#b9808c",
};

/** Estrela de quatro pontas centrada em (0,0) com raio r. */
function star(r: number, pinch = 0.16) {
  const k = r * pinch;
  return `M0 ${-r} Q${k} ${-k} ${r} 0 Q${k} ${k} 0 ${r} Q${-k} ${k} ${-r} 0 Q${-k} ${-k} 0 ${-r}Z`;
}

/** Nuvem feita de círculos sobrepostos. */
function Cloud({ x, y, s, fill, opacity = 0.55 }: { x: number; y: number; s: number; fill: string; opacity?: number }) {
  const parts: [number, number, number][] = [
    [0, 0, 1],
    [-0.95, 0.28, 0.72],
    [0.98, 0.3, 0.78],
    [0.08, -0.58, 0.68],
    [-0.42, 0.62, 0.55],
    [0.62, 0.66, 0.5],
  ];
  return (
    <g fill={fill} opacity={opacity}>
      {parts.map(([dx, dy, r], i) => (
        <circle key={i} cx={x + dx * s} cy={y + dy * s} r={r * s} />
      ))}
    </g>
  );
}

function Planet({ x, y, r, fill, ring = C.mauve, tilt = -20, float = false }: {
  x: number; y: number; r: number; fill: string; ring?: string; tilt?: number; float?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={float ? "animate-float" : undefined}>
        <circle r={r} fill={fill} />
        <path d={`M${-r * 0.82} ${-r * 0.3} Q0 ${-r * 0.1} ${r * 0.82} ${-r * 0.3}`} fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.5" />
        <ellipse rx={r * 2.15} ry={r * 0.52} transform={`rotate(${tilt})`} fill="none" stroke={ring} strokeWidth="1.4" strokeOpacity="0.8" vectorEffect="non-scaling-stroke" />
      </g>
    </g>
  );
}

function Moon({ x, y, r, rotate = 0, fill = C.lilac }: { x: number; y: number; r: number; rotate?: number; fill?: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${r})`}>
      <path d="M0 -1 A1 1 0 0 0 0 1 A1.38 1.38 0 0 1 0 -1Z" fill={fill} />
    </g>
  );
}

function Orbit({ d, from, to, color = C.gold, dashed = false }: { d: string; from?: [number, number]; to?: [number, number]; color?: string; dashed?: boolean }) {
  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="1.3"
        strokeOpacity="0.7"
        strokeLinecap="round"
        strokeDasharray={dashed ? "2 9" : undefined}
        vectorEffect="non-scaling-stroke"
      />
      {from ? <circle cx={from[0]} cy={from[1]} r="3.2" fill={color} /> : null}
      {to ? <circle cx={to[0]} cy={to[1]} r="3.2" fill={color} /> : null}
    </g>
  );
}

type StarSpec = [x: number, y: number, r: number, color: string, twinkle?: boolean];

const STARS: StarSpec[] = [
  [96, 70, 11, C.gold, true], [250, 40, 7, C.rose], [372, 214, 14, C.rose, true], [520, 64, 9, C.gold],
  [610, 150, 6, C.violet], [700, 40, 10, C.rose], [832, 120, 7, C.gold, true], [960, 52, 12, C.violet],
  [1090, 130, 9, C.gold], [1200, 70, 16, C.gold, true], [1340, 120, 8, C.rose], [1398, 250, 6, C.sky],
  [60, 300, 12, C.gold, true], [190, 390, 7, C.violet], [300, 330, 8, C.rose], [430, 420, 6, C.gold],
  [760, 300, 6, C.sky, true], [905, 240, 8, C.rose], [1010, 330, 6, C.gold], [1290, 470, 13, C.gold, true],
  [1380, 560, 8, C.violet], [40, 520, 7, C.rose], [150, 560, 15, C.gold, true], [280, 640, 6, C.sky],
  [520, 560, 7, C.violet], [640, 690, 11, C.rose, true], [800, 600, 6, C.gold], [930, 720, 9, C.violet],
  [1060, 640, 7, C.gold], [1180, 760, 12, C.rose, true], [1320, 700, 7, C.sky], [1400, 820, 9, C.gold],
  [90, 830, 9, C.violet], [230, 790, 11, C.gold, true], [420, 850, 7, C.rose], [560, 810, 6, C.gold],
  [860, 850, 12, C.gold, true], [1130, 860, 6, C.sky],
];

const DUST: [number, number, number, string][] = [
  [140, 210, 2.2, C.violet], [330, 120, 2, C.gold], [450, 300, 2.4, C.rose], [560, 240, 1.8, C.sky],
  [690, 220, 2.2, C.rose], [820, 200, 2, C.violet], [980, 170, 2.4, C.gold], [1120, 250, 2, C.rose],
  [1260, 200, 2.2, C.sky], [1350, 340, 2, C.gold], [230, 480, 2.2, C.rose], [370, 520, 2, C.violet],
  [480, 640, 2.4, C.gold], [700, 520, 2, C.sky], [850, 440, 2.2, C.rose], [1000, 540, 2, C.violet],
  [1150, 600, 2.4, C.gold], [1250, 640, 2, C.rose], [110, 710, 2.2, C.sky], [330, 880, 2, C.gold],
  [740, 880, 2.2, C.violet], [980, 800, 2, C.rose], [1260, 870, 2.2, C.gold],
];

export function CosmosBackground({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      className={cn("pointer-events-none h-full w-full select-none", className)}
    >
      {/* nuvens */}
      <Cloud x={40} y={30} s={150} fill={C.pink} opacity={0.5} />
      <Cloud x={-30} y={330} s={160} fill={C.lilac} opacity={0.5} />
      <Cloud x={20} y={600} s={110} fill={C.sage} opacity={0.5} />
      <Cloud x={90} y={900} s={190} fill={C.pink} opacity={0.6} />
      <Cloud x={380} y={980} s={140} fill={C.lilac} opacity={0.5} />
      <Cloud x={1400} y={20} s={130} fill={C.lilac} opacity={0.5} />
      <Cloud x={1450} y={420} s={120} fill={C.sage} opacity={0.5} />
      <Cloud x={1360} y={900} s={200} fill={C.pink} opacity={0.6} />
      <Cloud x={1130} y={990} s={150} fill={C.lilac} opacity={0.5} />

      {/* órbitas */}
      <Orbit d="M0 170 C140 120 260 60 380 -10" from={[0, 170]} color={C.mauve} />
      <Orbit d="M1440 210 C1330 170 1250 100 1225 -10" to={[1440, 210]} color={C.gold} />
      <Orbit d="M-10 720 C80 570 200 520 330 560" to={[330, 560]} color={C.gold} />
      <Orbit d="M1090 910 C1180 790 1300 730 1440 700" from={[1090, 910]} color={C.mauve} />
      <Orbit d="M520 120 C600 175 700 195 770 160" color={C.gold} dashed />
      <Orbit d="M300 780 C380 720 470 705 545 735" color={C.mauve} dashed />
      <Orbit d="M900 770 C980 700 1080 690 1170 720" color={C.gold} dashed />

      {/* luas */}
      <Moon x={470} y={110} r={26} rotate={18} />
      <Moon x={1185} y={205} r={22} rotate={-24} />
      <Moon x={95} y={765} r={28} rotate={160} />
      <Moon x={1005} y={860} r={22} rotate={-10} fill={C.sage} />

      {/* planetas */}
      <Planet x={170} y={96} r={17} fill={C.lilac} float />
      <Planet x={1262} y={338} r={24} fill={C.lilac} tilt={-14} />
      <Planet x={700} y={822} r={19} fill={C.pink} tilt={-18} float />
      <Planet x={118} y={640} r={13} fill={C.sage} tilt={-26} />

      {/* estrelas e brilhos */}
      {STARS.map(([x, y, r, color, twinkle], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <path
            d={star(r)}
            fill={color}
            className={twinkle ? "animate-twinkle" : undefined}
            style={twinkle ? { transformBox: "fill-box", transformOrigin: "center", animationDelay: `${-(i % 7) * 0.6}s` } : undefined}
          />
        </g>
      ))}
      {DUST.map(([x, y, r, color], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={color} opacity="0.85" />
      ))}
    </svg>
  );
}

/* ---------- Versão vertical (celular) ---------- */

const STARS_V: StarSpec[] = [
  [70, 60, 13, C.gold, true], [300, 36, 8, C.rose], [520, 90, 12, C.violet, true], [560, 250, 7, C.gold],
  [40, 270, 9, C.rose], [150, 330, 6, C.sky, true], [330, 300, 7, C.gold], [500, 420, 10, C.rose, true],
  [60, 520, 14, C.gold, true], [240, 480, 6, C.violet], [400, 560, 8, C.sky], [550, 640, 7, C.gold, true],
  [110, 700, 8, C.rose], [300, 740, 12, C.violet, true], [470, 800, 8, C.gold], [40, 860, 10, C.gold, true],
  [200, 900, 7, C.rose], [380, 940, 13, C.rose, true], [560, 960, 7, C.sky], [120, 980, 6, C.violet],
];

const DUST_V: [number, number, number, string][] = [
  [180, 130, 2.2, C.gold], [430, 180, 2, C.violet], [250, 220, 2.2, C.rose], [90, 400, 2, C.sky],
  [460, 340, 2.2, C.gold], [200, 600, 2, C.rose], [520, 540, 2.2, C.violet], [330, 660, 2, C.gold],
  [60, 780, 2.2, C.sky], [430, 700, 2, C.rose], [260, 840, 2.2, C.gold], [520, 880, 2, C.violet],
];

export function CosmosBackgroundMobile({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 1000"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      className={cn("pointer-events-none h-full w-full select-none", className)}
    >
      <Cloud x={20} y={40} s={120} fill={C.pink} opacity={0.75} />
      <Cloud x={610} y={170} s={110} fill={C.lilac} opacity={0.75} />
      <Cloud x={-10} y={400} s={105} fill={C.sage} opacity={0.75} />
      <Cloud x={620} y={560} s={120} fill={C.pink} opacity={0.7} />
      <Cloud x={10} y={760} s={110} fill={C.lilac} opacity={0.75} />
      <Cloud x={120} y={1030} s={150} fill={C.pink} opacity={0.8} />
      <Cloud x={520} y={1010} s={140} fill={C.sage} opacity={0.75} />

      <Orbit d="M0 150 C120 120 220 70 300 -10" from={[0, 150]} color={C.mauve} />
      <Orbit d="M600 340 C520 330 470 300 450 250" to={[600, 340]} color={C.gold} />
      <Orbit d="M-10 620 C70 560 160 540 240 570" to={[240, 570]} color={C.gold} />
      <Orbit d="M600 800 C520 760 440 760 380 800" from={[600, 800]} color={C.mauve} />
      <Orbit d="M200 240 C260 280 340 285 400 255" color={C.gold} dashed />
      <Orbit d="M80 900 C150 860 240 855 310 885" color={C.mauve} dashed />

      <Moon x={455} y={120} r={26} rotate={18} />
      <Moon x={85} y={600} r={24} rotate={160} />
      <Moon x={520} y={720} r={22} rotate={-12} fill={C.sage} />

      <Planet x={150} y={110} r={18} fill={C.lilac} float />
      <Planet x={520} y={470} r={22} fill={C.lilac} tilt={-14} />
      <Planet x={110} y={820} r={18} fill={C.pink} tilt={-18} float />
      <Planet x={470} y={910} r={14} fill={C.sage} tilt={-26} />

      {STARS_V.map(([x, y, r, color, twinkle], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <path
            d={star(r)}
            fill={color}
            className={twinkle ? "animate-twinkle" : undefined}
            style={twinkle ? { transformBox: "fill-box", transformOrigin: "center", animationDelay: `${-(i % 7) * 0.6}s` } : undefined}
          />
        </g>
      ))}
      {DUST_V.map(([x, y, r, color], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={color} opacity="0.9" />
      ))}
    </svg>
  );
}
