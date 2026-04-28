import { Box, Typography } from '@mui/material';
import { COLORS } from '@/theme/theme';
import { HistoryPoint } from '@/api/zabbix';

interface MiniLineChartProps {
  data: HistoryPoint[];
  color?: string;
  height?: number;
  unit?: string;
  label?: string;
  maxY?: number;
}

export function MiniLineChart({
  data, color = COLORS.accent, height = 80, unit = '%', label, maxY,
}: MiniLineChartProps) {
  if (data.length < 2) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', color: COLORS.muted }}>
          sem dados históricos
        </Typography>
      </Box>
    );
  }

  const W = 400;
  const H = height;
  const PAD = { top: 8, right: 8, bottom: 20, left: 36 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const values = data.map((d) => parseFloat(d.value));
  const times  = data.map((d) => parseInt(d.clock));
  const minV = 0;
  const maxV = maxY ?? Math.max(...values, 0.001);
  const minT = times[0];
  const maxT = times[times.length - 1];

  const scaleX = (t: number) =>
    PAD.left + ((t - minT) / (maxT - minT || 1)) * chartW;
  const scaleY = (v: number) =>
    PAD.top + chartH - ((v - minV) / (maxV - minV || 1)) * chartH;

  const points = data.map((d) => ({
    x: scaleX(parseInt(d.clock)),
    y: scaleY(parseFloat(d.value)),
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  const areaPath = [
    `M ${points[0].x.toFixed(1)} ${(PAD.top + chartH).toFixed(1)}`,
    ...points.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`),
    `L ${points[points.length - 1].x.toFixed(1)} ${(PAD.top + chartH).toFixed(1)}`,
    'Z',
  ].join(' ');

  // Y axis ticks
  const ticks = [0, 0.5, 1].map((t) => ({
    value: minV + t * (maxV - minV),
    y: scaleY(minV + t * (maxV - minV)),
  }));

  // Last value
  const lastVal = values[values.length - 1];
  const lastTime = new Date(times[times.length - 1] * 1000)
    .toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const gradId = `grad-${Math.random().toString(36).slice(2)}`;

  return (
    <Box>
      {label && (
        <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: '0.62rem', color: COLORS.muted, mb: 0.5, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {label}
        </Typography>
      )}
      <Box sx={{ position: 'relative' }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: '100%', height, display: 'block' }}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {ticks.map((t, i) => (
            <g key={i}>
              <line
                x1={PAD.left} y1={t.y} x2={W - PAD.right} y2={t.y}
                stroke={COLORS.border} strokeWidth="1"
              />
              <text
                x={PAD.left - 4} y={t.y + 4}
                fontSize="9" fill={COLORS.muted} textAnchor="end"
              >
                {t.value < 1 ? t.value.toFixed(1) : Math.round(t.value)}{unit === '%' ? '%' : ''}
              </text>
            </g>
          ))}

          {/* Area fill */}
          <path d={areaPath} fill={`url(#${gradId})`} />

          {/* Line */}
          <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

          {/* Last dot */}
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="3" fill={color}
          />

          {/* Time label */}
          <text
            x={W - PAD.right} y={H - 4}
            fontSize="9" fill={COLORS.muted} textAnchor="end"
          >
            {lastTime}
          </text>
        </svg>

        {/* Last value overlay */}
        <Box sx={{
          position: 'absolute', bottom: 18, left: PAD.left + 4,
          fontFamily: "'Space Mono', monospace",
          fontSize: '0.75rem', fontWeight: 700,
          color,
        }}>
          {lastVal.toFixed(unit === '%' ? 1 : 2)}{unit}
        </Box>
      </Box>
    </Box>
  );
}
