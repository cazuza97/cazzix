import {
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Typography, Box, Skeleton,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useNavigate } from 'react-router-dom';
import { ZabbixHost } from '@/types';
import { COLORS } from '@/theme/theme';

interface HostsTableProps {
  hosts: ZabbixHost[];
  loading?: boolean;
}

type AvailStatus = { label: string; color: string; bg: string };

function getStatus(host: ZabbixHost): AvailStatus {
  if (host.status === '1') return { label: 'Desabilitado', color: COLORS.muted,   bg: `${COLORS.muted}18` };
  if (host.available === '2') return { label: 'Indisponível', color: COLORS.danger, bg: `${COLORS.danger}18` };
  if (host.available === '0') return { label: 'Desconhecido', color: COLORS.warn,   bg: `${COLORS.warn}18` };
  return { label: 'OK', color: COLORS.accent, bg: `${COLORS.accent}18` };
}

function SkeletonRows() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton variant="text" width="70%" sx={{ bgcolor: COLORS.surface2 }} /></TableCell>
          <TableCell><Skeleton variant="text" width="80px" sx={{ bgcolor: COLORS.surface2 }} /></TableCell>
          <TableCell><Skeleton variant="text" width="90px" sx={{ bgcolor: COLORS.surface2 }} /></TableCell>
          <TableCell><Skeleton variant="rounded" width={70} height={20} sx={{ bgcolor: COLORS.surface2 }} /></TableCell>
          <TableCell><Skeleton variant="rounded" width={24} height={20} sx={{ bgcolor: COLORS.surface2 }} /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function HostsTable({ hosts, loading }: HostsTableProps) {
  const navigate = useNavigate();

  const handleRowClick = (host: ZabbixHost) => {
    navigate(`/host/${host.hostid}/${encodeURIComponent(host.name)}`);
  };

  return (
    <Paper elevation={0}>
      {/* Panel header */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 2.5, py: 1.5,
        borderBottom: `1px solid ${COLORS.border}`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.accent, boxShadow: `0 0 6px ${COLORS.accent}` }} />
          <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Hosts Monitorados</Typography>
        </Box>
        <Chip
          label={`${hosts.length} hosts`}
          size="small"
          sx={{ height: 20, fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', background: COLORS.surface2, color: COLORS.muted }}
        />
      </Box>

      <TableContainer sx={{ maxHeight: 380 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Host</TableCell>
              <TableCell>IP</TableCell>
              <TableCell>Grupo</TableCell>
              <TableCell>Status</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <SkeletonRows />
            ) : hosts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: '0.75rem', color: 'text.secondary' }}>
                    Nenhum host encontrado.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              hosts.map((host) => {
                const s = getStatus(host);
                const ip = host.interfaces?.[0]?.ip ?? '—';
                const group = host.groups?.[0]?.name ?? '—';
                return (
                  <TableRow
                    key={host.hostid}
                    onClick={() => handleRowClick(host)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover td': { background: 'rgba(255,255,255,0.03)' },
                      '&:hover .row-icon': { opacity: 1 },
                    }}
                  >
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.82rem' }}>{host.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: '0.7rem', color: 'text.secondary' }}>
                        {ip}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: '0.7rem', color: 'text.secondary' }}>
                        {group}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={s.label}
                        size="small"
                        sx={{
                          height: 20,
                          background: s.bg,
                          color: s.color,
                          border: `1px solid ${s.color}40`,
                          fontSize: '0.6rem',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ width: 32, pr: 1.5 }}>
                      <OpenInNewIcon
                        className="row-icon"
                        sx={{
                          fontSize: 14,
                          color: COLORS.muted,
                          opacity: 0,
                          transition: 'opacity 0.15s',
                          display: 'block',
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
