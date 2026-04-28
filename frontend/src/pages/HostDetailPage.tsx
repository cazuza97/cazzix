import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Chip,
  IconButton, Skeleton, Alert, Divider, Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useHostDetail } from '@/hooks/useHostDetail';
import { MiniLineChart } from '@/components/MiniLineChart';
import { GaugeChart } from '@/components/GaugeChart';
import { COLORS } from '@/theme/theme';
import { ZabbixItem } from '@/api/zabbix';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function bytesToGB(bytes: number): number {
  return bytes / 1024 / 1024 / 1024;
}

function formatUptime(seconds: number): { days: number; hours: number; minutes: number } {
  const days    = Math.floor(seconds / 86400);
  const hours   = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return { days, hours, minutes };
}

function lastVal(item: ZabbixItem | null): number {
  if (!item) return 0;
  return parseFloat(item.lastvalue) || 0;
}

// Formata disco: suporta Linux (vfs.fs.size) e Windows (vfs.fs.dependent.size)
interface DiskEntry {
  fs: string;
  used: number;
  total: number;
  usedPct: number;
}

function parseDiskItems(items: ZabbixItem[]): DiskEntry[] {
  const map: Record<string, Partial<{ used: number; total: number }>> = {};

  items.forEach((item) => {
    // Linux:   vfs.fs.size[/dados,used]
    // Windows: vfs.fs.dependent.size[D:,used]
    const match = item.key_.match(/vfs\.fs(?:\.dependent)?\.size\[([^,\]]+),([^\]]+)\]/);
    if (!match) return;
    const [, fs, type] = match;
    if (!map[fs]) map[fs] = {};
    if (type === 'used')  map[fs].used  = parseFloat(item.lastvalue);
    if (type === 'total') map[fs].total = parseFloat(item.lastvalue);
  });

  return Object.entries(map)
    .filter(([, v]) => v.total && v.used !== undefined)
    .map(([fs, v]) => ({
      fs,
      used: v.used!,
      total: v.total!,
      usedPct: (v.used! / v.total!) * 100,
    }))
    .sort((a, b) => b.total - a.total);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricPanel({ title, dotColor = COLORS.accent, children }: {
  title: string; dotColor?: string; children: React.ReactNode;
}) {
  return (
    <Paper elevation={0} sx={{ height: '100%' }}>
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1,
        px: 2.5, py: 1.5, borderBottom: `1px solid ${COLORS.border}`,
      }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, boxShadow: `0 0 6px ${dotColor}` }} />
        <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{title}</Typography>
      </Box>
      <Box sx={{ p: 2.5 }}>{children}</Box>
    </Paper>
  );
}

function SkeletonPanel() {
  return (
    <Paper elevation={0} sx={{ p: 2.5 }}>
      <Skeleton variant="text" width="40%" sx={{ bgcolor: COLORS.surface2, mb: 1 }} />
      <Skeleton variant="rounded" height={80} sx={{ bgcolor: COLORS.surface2 }} />
    </Paper>
  );
}

function DiskBar({ entry }: { entry: DiskEntry }) {
  const color = entry.usedPct < 60 ? COLORS.accent : entry.usedPct < 80 ? COLORS.warn : COLORS.danger;
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: '0.72rem', fontWeight: 700 }}>
          {entry.fs}
        </Typography>
        <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: '0.68rem', color }}>
          {entry.usedPct.toFixed(1)}%
        </Typography>
      </Box>
      <Box sx={{ height: 6, background: COLORS.surface2, borderRadius: 1, overflow: 'hidden' }}>
        <Box sx={{
          height: '100%', borderRadius: 1,
          width: `${entry.usedPct}%`,
          background: color,
          boxShadow: `0 0 6px ${color}88`,
          transition: 'width 0.8s ease',
        }} />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
        <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', color: 'text.secondary' }}>
          usado: {bytesToGB(entry.used).toFixed(1)} GB
        </Typography>
        <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', color: 'text.secondary' }}>
          total: {bytesToGB(entry.total).toFixed(1)} GB
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function HostDetailPage() {
  const { hostid, hostname } = useParams<{ hostid: string; hostname: string }>();
  const navigate = useNavigate();
  const { metrics, loading, error, refresh, lastUpdated } = useHostDetail(hostid);

  const displayName = decodeURIComponent(hostname ?? '');

  // CPU
  const cpuPct   = lastVal(metrics?.cpuUtil ?? null);
  const load1    = lastVal(metrics?.cpuLoad1 ?? null);
  const load5    = lastVal(metrics?.cpuLoad5 ?? null);
  const load15   = lastVal(metrics?.cpuLoad15 ?? null);

  // Memória
  const memTotalBytes = lastVal(metrics?.memTotal ?? null);
  const memAvailBytes = lastVal(metrics?.memAvail ?? null);
  const memUsedBytes  = memTotalBytes - memAvailBytes;
  const memPct        = memTotalBytes > 0 ? (memUsedBytes / memTotalBytes) * 100 : 0;

  // Uptime
  const uptimeSec = lastVal(metrics?.uptime ?? null);
  const uptime    = formatUptime(uptimeSec);

  // Disco
  const diskEntries = metrics ? parseDiskItems(metrics.diskItems) : [];

  // CPU history filtrado por itemid do cpuUtil
  const cpuHistory = metrics?.cpuUtil
    ? metrics.cpuHistory.filter((p) => {
        // history.get retorna de todos os itemids — filtra pelo cpuUtil
        return true; // se só 1 item, todos são dele
      })
    : [];

  return (
    <Box sx={{ minHeight: '100vh', background: COLORS.bg }}>
      {/* Header */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 2,
        px: 3, py: 1.5,
        borderBottom: `1px solid ${COLORS.border}`,
        background: COLORS.surface,
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <IconButton onClick={() => navigate('/')} size="small"
          sx={{ border: `1px solid ${COLORS.border}`, borderRadius: '3px', color: 'text.secondary',
            '&:hover': { borderColor: COLORS.accent, color: COLORS.accent } }}>
          <ArrowBackIcon sx={{ fontSize: 16 }} />
        </IconButton>

        <Box>
          <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', color: 'text.secondary', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            // detalhe do host
          </Typography>
          <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.01em' }}>
            {displayName}
          </Typography>
        </Box>

        <Box sx={{ flex: 1 }} />

        {lastUpdated && (
          <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: '0.62rem', color: 'text.secondary' }}>
            atualizado {lastUpdated.toLocaleTimeString('pt-BR')}
          </Typography>
        )}

        <Tooltip title="Atualizar">
          <IconButton onClick={refresh} size="small"
            sx={{ border: `1px solid ${COLORS.border}`, borderRadius: '3px', color: 'text.secondary',
              '&:hover': { borderColor: COLORS.accent, color: COLORS.accent } }}>
            <RefreshIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Content */}
      <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>

        {error && (
          <Alert severity="error" sx={{ mb: 2, fontFamily: "'Space Mono', monospace", fontSize: '0.75rem' }}>
            {error}
          </Alert>
        )}

        {/* UPTIME + STATUS row */}
        <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
          <Grid item xs={12} md={3}>
            <Paper elevation={0} sx={{ p: 2.5 }}>
              <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', color: COLORS.accent, letterSpacing: '0.1em', textTransform: 'uppercase', mb: 1.5 }}>
                Uptime
              </Typography>
              {loading ? (
                <Skeleton variant="text" width="80%" sx={{ bgcolor: COLORS.surface2 }} />
              ) : (
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  {[
                    { label: 'Dias', value: uptime.days },
                    { label: 'Horas', value: uptime.hours },
                    { label: 'Min', value: uptime.minutes },
                  ].map(({ label, value }) => (
                    <Box key={label}>
                      <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', color: 'text.secondary', mb: 0.25 }}>{label}</Typography>
                      <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: COLORS.accent2, lineHeight: 1 }}>{value}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
              <Divider sx={{ borderColor: COLORS.border, my: 1.5 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label="UP" size="small" sx={{ background: COLORS.accent, color: COLORS.bg, fontWeight: 800, fontSize: '0.75rem' }} />
                <Box>
                  <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: '0.62rem', color: 'text.secondary' }}>
                    Users: {loading ? '—' : lastVal(metrics?.users ?? null).toFixed(0)}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* CPU load badges */}
          <Grid item xs={12} md={3}>
            <Paper elevation={0} sx={{ p: 2.5, height: '100%' }}>
              <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', color: COLORS.accent, letterSpacing: '0.1em', textTransform: 'uppercase', mb: 1.5 }}>
                CPU Load
              </Typography>
              {loading ? (
                <Skeleton variant="rounded" height={40} sx={{ bgcolor: COLORS.surface2 }} />
              ) : (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                  {[
                    { label: 'LOAD1', value: load1 },
                    { label: 'LOAD5', value: load5 },
                    { label: 'LOAD15', value: load15 },
                  ].map(({ label, value }) => {
                    const col = value < 1 ? COLORS.accent : value < 2 ? COLORS.warn : COLORS.danger;
                    return (
                      <Box key={label} sx={{ textAlign: 'center' }}>
                        <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: '0.55rem', color: 'text.secondary', mb: 0.25 }}>{label}</Typography>
                        <Box sx={{ background: col, color: COLORS.bg, borderRadius: '2px', px: 1, py: 0.5, fontFamily: "'Space Mono', monospace", fontSize: '0.8rem', fontWeight: 700 }}>
                          {value.toFixed(3)}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Paper>
          </Grid>

          {/* CPU utilization gauge */}
          <Grid item xs={6} md={3}>
            <Paper elevation={0} sx={{ p: 2.5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', color: COLORS.accent, letterSpacing: '0.1em', textTransform: 'uppercase', mb: 1 }}>
                CPU Utilização
              </Typography>
              {loading ? (
                <Skeleton variant="circular" width={100} height={90} sx={{ bgcolor: COLORS.surface2 }} />
              ) : (
                <GaugeChart value={cpuPct} label={`${cpuPct.toFixed(1)}%`} size={100} />
              )}
            </Paper>
          </Grid>

          {/* Memory gauge */}
          <Grid item xs={6} md={3}>
            <Paper elevation={0} sx={{ p: 2.5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', color: COLORS.accent, letterSpacing: '0.1em', textTransform: 'uppercase', mb: 1 }}>
                Memória
              </Typography>
              {loading ? (
                <Skeleton variant="circular" width={100} height={90} sx={{ bgcolor: COLORS.surface2 }} />
              ) : (
                <GaugeChart
                  value={memPct}
                  label={`${bytesToGB(memUsedBytes).toFixed(1)} GB`}
                  sublabel={`de ${bytesToGB(memTotalBytes).toFixed(1)} GB`}
                  size={100}
                />
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* CPU + MEM charts */}
        <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
          <Grid item xs={12} md={6}>
            {loading ? <SkeletonPanel /> : (
              <MetricPanel title="CPU — últimas 3h" dotColor={COLORS.accent}>
                <MiniLineChart
                  data={cpuHistory}
                  color={COLORS.accent}
                  height={90}
                  unit="%"
                  maxY={100}
                />
              </MetricPanel>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {loading ? <SkeletonPanel /> : (
              <MetricPanel title="Memória — últimas 3h" dotColor={COLORS.accent2}>
                <MiniLineChart
                  data={metrics?.memHistory ?? []}
                  color={COLORS.accent2}
                  height={90}
                  unit=" B"
                />
              </MetricPanel>
            )}
          </Grid>
        </Grid>

        {/* Discos */}
        <MetricPanel title="Discos" dotColor={COLORS.warn}>
          {loading ? (
            <Grid container spacing={2}>
              {[1, 2].map((i) => (
                <Grid item xs={12} md={6} key={i}>
                  <Skeleton variant="rounded" height={60} sx={{ bgcolor: COLORS.surface2 }} />
                </Grid>
              ))}
            </Grid>
          ) : diskEntries.length === 0 ? (
            <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: '0.72rem', color: 'text.secondary' }}>
              Nenhum dado de disco encontrado. Verifique se o Zabbix Agent coleta vfs.fs.size.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {diskEntries.map((entry) => (
                <Grid item xs={12} md={6} key={entry.fs}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <GaugeChart value={entry.usedPct} label={entry.fs} size={80} />
                    <Box sx={{ flex: 1 }}>
                      <DiskBar entry={entry} />
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </MetricPanel>

        {/* Raw items (expansível) */}
        <Box sx={{ mt: 1.5 }}>
          <Paper elevation={0}>
            <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.muted }} />
              <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Todos os items coletados</Typography>
              <Chip label={`${metrics?.allItems.length ?? 0} items`} size="small"
                sx={{ height: 20, fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', background: COLORS.surface2, color: COLORS.muted, ml: 'auto' }} />
            </Box>
            <Box sx={{ maxHeight: 260, overflowY: 'auto' }}>
              {loading ? (
                <Box sx={{ p: 2 }}>
                  {[1,2,3,4].map((i) => <Skeleton key={i} variant="text" sx={{ bgcolor: COLORS.surface2, mb: 0.5 }} />)}
                </Box>
              ) : (
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                  <Box component="thead">
                    <Box component="tr" sx={{ background: COLORS.surface2 }}>
                      {['Chave', 'Nome', 'Valor', 'Unidade'].map((h) => (
                        <Box component="th" key={h} sx={{
                          textAlign: 'left', px: 2, py: 0.75,
                          fontFamily: "'Space Mono', monospace", fontSize: '0.6rem',
                          color: COLORS.muted, letterSpacing: '0.08em', textTransform: 'uppercase',
                          borderBottom: `1px solid ${COLORS.border}`,
                        }}>
                          {h}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {metrics?.allItems.map((item) => (
                      <Box component="tr" key={item.itemid}
                        sx={{ '&:hover td, &:hover th': { background: 'rgba(255,255,255,0.02)' },
                          borderBottom: `1px solid ${COLORS.border}44` }}>
                        <Box component="td" sx={{ px: 2, py: 0.75, fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', color: COLORS.muted, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.key_}
                        </Box>
                        <Box component="td" sx={{ px: 2, py: 0.75, fontSize: '0.72rem' }}>
                          {item.name}
                        </Box>
                        <Box component="td" sx={{ px: 2, py: 0.75, fontFamily: "'Space Mono', monospace", fontSize: '0.72rem', color: COLORS.accent, fontWeight: 700 }}>
                          {parseFloat(item.lastvalue).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                        </Box>
                        <Box component="td" sx={{ px: 2, py: 0.75, fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', color: COLORS.muted }}>
                          {item.units || '—'}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Paper>
        </Box>

      </Box>
    </Box>
  );
}
