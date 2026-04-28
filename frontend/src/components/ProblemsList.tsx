import { Paper, Box, Typography, Chip, Skeleton } from '@mui/material';
import { ZabbixProblem, ZabbixHost, SEVERITY_LABEL, SEVERITY_COLOR } from '@/types';
import { COLORS } from '@/theme/theme';

interface ProblemsListProps {
  problems: ZabbixProblem[];
  hosts: ZabbixHost[];
  loading?: boolean;
}

function formatTime(clock: number): string {
  const date = new Date(clock * 1000);
  return date.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

function SkeletonItems() {
  return (
    <>
      {[...Array(3)].map((_, i) => (
        <Box key={i} sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${COLORS.border}44`, display: 'flex', gap: 1.5 }}>
          <Skeleton variant="rounded" width={4} height={50} sx={{ bgcolor: COLORS.surface2, flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="40%" sx={{ bgcolor: COLORS.surface2, mb: 0.5 }} />
            <Skeleton variant="text" width="85%" sx={{ bgcolor: COLORS.surface2 }} />
          </Box>
        </Box>
      ))}
    </>
  );
}

export function ProblemsList({ problems, hosts, loading }: ProblemsListProps) {
  const hostMap = Object.fromEntries(hosts.map((h) => [h.hostid, h.name]));

  return (
    <Paper elevation={0}>
      {/* Panel header */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 2.5, py: 1.5,
        borderBottom: `1px solid ${COLORS.border}`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.danger, boxShadow: `0 0 6px ${COLORS.danger}` }} />
          <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Problemas Recentes</Typography>
        </Box>
        <Chip
          label={`${problems.length} problema${problems.length !== 1 ? 's' : ''}`}
          size="small"
          sx={{
            height: 20, fontFamily: "'Space Mono', monospace", fontSize: '0.6rem',
            background: problems.length > 0 ? `${COLORS.danger}20` : COLORS.surface2,
            color: problems.length > 0 ? COLORS.danger : COLORS.muted,
          }}
        />
      </Box>

      <Box sx={{ maxHeight: 380, overflowY: 'auto' }}>
        {loading ? (
          <SkeletonItems />
        ) : problems.length === 0 ? (
          <Box sx={{ py: 5, textAlign: 'center' }}>
            <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: '0.75rem', color: COLORS.accent, mb: 0.5 }}>
              ✓ Nenhum problema ativo
            </Typography>
            <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', color: 'text.secondary' }}>
              Infraestrutura operando normalmente.
            </Typography>
          </Box>
        ) : (
          problems.map((p) => {
            const color = SEVERITY_COLOR[p.severity] ?? COLORS.muted;
            const label = SEVERITY_LABEL[p.severity] ?? 'N/A';
            const host = hostMap[p.hostid] ?? `Host #${p.hostid}`;
            return (
              <Box
                key={p.eventid}
                sx={{
                  display: 'flex', gap: 1.5, px: 2.5, py: 1.5,
                  borderBottom: `1px solid ${COLORS.border}44`,
                  transition: 'background 0.15s',
                  '&:hover': { background: 'rgba(255,255,255,0.02)' },
                  '&:last-child': { borderBottom: 'none' },
                }}
              >
                {/* Severity bar */}
                <Box sx={{
                  width: 4, borderRadius: '2px', flexShrink: 0,
                  minHeight: 36, background: color,
                }} />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', color: 'text.secondary', mb: 0.25 }}>
                    {host}
                  </Typography>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, lineHeight: 1.35, mb: 0.5, wordBreak: 'break-word' }}>
                    {p.name}
                  </Typography>
                  <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: '0.62rem', color: 'text.secondary' }}>
                    {formatTime(p.clock)}
                  </Typography>
                </Box>

                <Chip
                  label={label}
                  size="small"
                  sx={{
                    alignSelf: 'flex-start',
                    flexShrink: 0,
                    height: 20,
                    background: `${color}20`,
                    color,
                    border: `1px solid ${color}40`,
                    fontSize: '0.58rem',
                    fontFamily: "'Space Mono', monospace",
                  }}
                />
              </Box>
            );
          })
        )}
      </Box>
    </Paper>
  );
}
