import { Box, Typography } from '@mui/material';
import { COLORS } from '@/theme/theme';

interface GaugeChartProps {
  value: number;     // 0–100
  label: string;
  sublabel?: string;
  size?: number;
}

function getGaugeColor(pct: number): string {
  if (pct < 60) return COLORS.accent;
  if (pct < 80) return COLORS.warn;
  return COLORS.danger;
}

export function GaugeChart({ value, label, sublabel, size = 120 }: GaugeChartProps) {
  const pct   = Math.min(Math.max(value, 0), 100);
  const color = getGaugeColor(pct);

  // SVG semicircle gauge
  const cx = 60, cy = 60, r = 46;
  const startAngle = -210; // degrees (left side)
  const sweepAngle = 240;  // total sweep

  function polarToXY(angleDeg: number, radius: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  function describeArc(startDeg: number, endDeg: number, radius: number) {
    const s = polarToXY(startDeg, radius);
    const e = polarToXY(endDeg, radius);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  const bgEnd    = startAngle + sweepAngle;
  const fillEnd  = startAngle + (sweepAngle * pct) / 100;

  // Tick marks
  const ticks = [0, 25, 50, 75, 100].map((t) => {
    const angle = startAngle + (sweepAngle * t) / 100;
    const inner = polarToXY(angle, r - 8);
    const outer = polarToXY(angle, r + 2);
    const lbl   = polarToXY(angle, r - 18);
    return { inner, outer, lbl, t };
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
      <svg width={size} height={size * 0.85} viewBox="0 0 120 100">
        {/* Background track */}
        <path
          d={describeArc(startAngle, bgEnd, r)}
          fill="none" stroke={COLORS.border} strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Value fill */}
        {pct > 0 && (
          <path
            d={describeArc(startAngle, fillEnd, r)}
            fill="none" stroke={color} strokeWidth="10"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 4px ${color}88)` }}
          />
        )}
        {/* Tick marks */}
        {ticks.map((t) => (
          <line
            key={t.t}
            x1={t.inner.x} y1={t.inner.y}
            x2={t.outer.x} y2={t.outer.y}
            stroke={COLORS.muted} strokeWidth="1"
          />
        ))}
        {/* Center value */}
        <text x={cx} y={cy + 6} textAnchor="middle" fontSize="18" fontWeight="800"
          fill={color} fontFamily="'Syne', sans-serif">
          {pct.toFixed(0)}%
        </text>
      </svg>
      <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: 'text.primary', textAlign: 'center', lineHeight: 1.2 }}>
        {label}
      </Typography>
      {sublabel && (
        <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: '0.62rem', color: 'text.secondary', textAlign: 'center' }}>
          {sublabel}
        </Typography>
      )}
    </Box>
  );
}
