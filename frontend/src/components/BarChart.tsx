import { Paper, Box, Typography, Tooltip } from '@mui/material';
import { ZabbixHost, ZabbixProblem } from '@/types';
import { COLORS } from '@/theme/theme';

interface BarChartProps {
  hosts: ZabbixHost[];
  problems: ZabbixProblem[];
}

const BAR_COLORS = [
  COLORS.accent, COLORS.accent2, COLORS.warn,
  COLORS.danger, '#a855f7', '#06b6d4', '#f97316', '#84cc16',
];

export function BarChart({ hosts, problems }: BarChartProps) {
  // Build problem counts per host name
  const nameById = Object.fromEntries(hosts.map((h) => [h.hostid, h.name]));
  const counts: Record<string, number> = {};
  problems.forEach((p) => {
    const name = nameById[p.hostid] ?? `#${p.hostid}`;
    counts[name] = (counts[name] ?? 0) + 1;
  });

  const items = hosts.slice(0, 8).map((h) => ({
    name: h.name.length > 12 ? h.name.slice(0, 11) + '…' : h.name,
    full: h.name,
    val: counts[h.name] ?? 0,
  }));

  const maxVal = Math.max(...items.map((i) => i.val), 1);

  return (
    <Paper elevation={0}>
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 2.5, py: 1.5,
        borderBottom: `1px solid ${COLORS.border}`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.accent2, boxShadow: `0 0 6px ${COLORS.accent2}` }} />
          <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Alertas por Host</Typography>
        </Box>
        <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: '0.62rem', color: 'text.secondary' }}>
          últimos registros
        </Typography>
      </Box>

      <Box sx={{ px: 2.5, py: 2.5 }}>
        {items.length === 0 ? (
          <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: '0.75rem', color: 'text.secondary', textAlign: 'center', py: 2 }}>
            Sem dados para exibir.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: 100 }}>
            {items.map((item, i) => {
              const pct = (item.val / maxVal) * 100;
              const barH = Math.max(pct, item.val > 0 ? 6 : 2);
              const color = item.val > 0 ? BAR_COLORS[i % BAR_COLORS.length] : COLORS.border;

              return (
                <Tooltip
                  key={item.full}
                  title={
                    <Box sx={{ fontFamily: "'Space Mono', monospace", fontSize: '0.7rem' }}>
                      <div>{item.full}</div>
                      <div style={{ color }}>{item.val} alerta{item.val !== 1 ? 's' : ''}</div>
                    </Box>
                  }
                  placement="top"
                  arrow
                >
                  <Box
                    sx={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      height: '100%',
                      justifyContent: 'flex-end',
                      cursor: 'default',
                    }}
                  >
                    <Box
                      sx={{
                        width: '100%',
                        height: `${barH}%`,
                        minHeight: 2,
                        background: color,
                        borderRadius: '2px 2px 0 0',
                        transition: 'height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        '&:hover': { opacity: 0.8 },
                      }}
                    />
                    <Typography
                      sx={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '0.52rem',
                        color: 'text.secondary',
                        textAlign: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        width: '100%',
                        lineHeight: 1.2,
                      }}
                    >
                      {item.name}
                    </Typography>
                  </Box>
                </Tooltip>
              );
            })}
          </Box>
        )}
      </Box>
    </Paper>
  );
}
