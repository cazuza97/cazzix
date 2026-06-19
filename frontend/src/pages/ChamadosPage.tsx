import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, LinearProgress, Alert, Chip, IconButton,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, Tooltip,
  CircularProgress,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FiberNewOutlinedIcon from '@mui/icons-material/FiberNewOutlined';
import { useAuth } from '@/hooks/useAuth';
import { AppHeader } from '@/components/AppHeader';
import { KpiCard } from '@/components/KpiCard';
import { COLORS } from '@/theme/theme';
import {
  fetchTickets, fetchGlpiStatus, createTicket, updateTicketStatus, fetchCategories,
} from '@/api/glpi';
import { GlpiTicket, GlpiCategory, GLPI_STATUS, GLPI_PRIORITY, CreateTicketPayload } from '@/types/glpi';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function StatusChip({ status }: { status: number }) {
  const s = GLPI_STATUS[status] ?? { label: `Status ${status}`, color: COLORS.muted };
  return (
    <Chip
      label={s.label}
      size="small"
      sx={{
        background: `${s.color}20`,
        color: s.color,
        border: `1px solid ${s.color}50`,
        fontFamily: "'Space Mono', monospace",
        fontSize: '0.62rem',
        height: 20,
      }}
    />
  );
}

function PriorityChip({ priority }: { priority: number }) {
  const p = GLPI_PRIORITY[priority] ?? { label: `P${priority}`, color: COLORS.muted };
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
      <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', color: p.color }}>
        {p.label}
      </Typography>
    </Box>
  );
}

// ─── Modal novo chamado ──────────────────────────────────────────────────────

interface NewTicketModalProps {
  open: boolean;
  categories: GlpiCategory[];
  onClose: () => void;
  onCreated: () => void;
}

function NewTicketModal({ open, categories, onClose, onCreated }: NewTicketModalProps) {
  const [form, setForm] = useState<CreateTicketPayload>({ name: '', content: '', priority: 3 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reset = () => { setForm({ name: '', content: '', priority: 3 }); setError(''); };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.content.trim()) {
      setError('Título e descrição são obrigatórios.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await createTicket(form);
      reset();
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar chamado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { background: COLORS.surface, border: `1px solid ${COLORS.border}` },
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, fontSize: '1rem', borderBottom: `1px solid ${COLORS.border}`, pb: 1.5 }}>
        Novo Chamado
      </DialogTitle>

      <DialogContent sx={{ pt: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {error && <Alert severity="error" sx={{ fontSize: '0.8rem' }}>{error}</Alert>}

        <TextField
          label="Título"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          fullWidth
          required
          size="small"
        />

        <TextField
          label="Descrição do problema"
          value={form.content}
          onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          fullWidth
          required
          multiline
          rows={4}
          size="small"
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" fullWidth>
            <InputLabel>Prioridade</InputLabel>
            <Select
              value={form.priority ?? 3}
              label="Prioridade"
              onChange={(e) => setForm((f) => ({ ...f, priority: Number(e.target.value) }))}
            >
              {Object.entries(GLPI_PRIORITY).map(([k, v]) => (
                <MenuItem key={k} value={Number(k)}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: v.color }} />
                    {v.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {categories.length > 0 && (
            <FormControl size="small" fullWidth>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={form.itilcategories_id ?? ''}
                label="Categoria"
                onChange={(e) => setForm((f) => ({ ...f, itilcategories_id: Number(e.target.value) || undefined }))}
              >
                <MenuItem value="">Sem categoria</MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ borderTop: `1px solid ${COLORS.border}`, px: 3, py: 1.5 }}>
        <Button onClick={handleClose} disabled={loading} sx={{ color: 'text.secondary' }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={14} color="inherit" /> : undefined}
        >
          Criar chamado
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export function ChamadosPage() {
  const { auth, logout } = useAuth();
  const [tickets, setTickets] = useState<GlpiTicket[]>([]);
  const [categories, setCategories] = useState<GlpiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [glpiConfigured, setGlpiConfigured] = useState<boolean | null>(null);
  const [glpiMessage, setGlpiMessage] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<number | ''>('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      // Verifica configuração GLPI na primeira carga
      if (glpiConfigured === null) {
        const status = await fetchGlpiStatus();
        setGlpiConfigured(status.configured);
        if (!status.configured) {
          setGlpiMessage(status.message ?? 'GLPI não configurado.');
          return;
        }
      }

      const [data, cats] = await Promise.all([
        fetchTickets(),
        categories.length === 0 ? fetchCategories() : Promise.resolve(categories),
      ]);

      setTickets(data);
      if (cats.length > 0) setCategories(cats);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar chamados.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [glpiConfigured, categories]);

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreated = () => {
    setModalOpen(false);
    load(true);
  };

  // KPIs
  const total       = tickets.length;
  const novos       = tickets.filter((t) => t.status === 1).length;
  const emAndamento = tickets.filter((t) => t.status === 2 || t.status === 3).length;
  const resolvidos  = tickets.filter((t) => t.status === 5 || t.status === 6).length;

  const filtered = filterStatus === ''
    ? tickets
    : tickets.filter((t) => t.status === filterStatus);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: COLORS.bg }}>
      <AppHeader
        user={auth?.user ?? ''}
        isDemo={auth?.demoMode ?? false}
        zabbixUrl={auth?.zabbixUrl ?? ''}
        groups={[]}
        selectedGroup=""
        onGroupChange={() => {}}
        onRefresh={() => load(true)}
        refreshing={refreshing}
        onLogout={logout}
        lastUpdated={lastUpdated}
      />

      {(loading || refreshing) && (
        <LinearProgress
          sx={{
            height: 2,
            background: COLORS.surface2,
            '& .MuiLinearProgress-bar': { background: COLORS.accent2 },
          }}
        />
      )}

      <Box sx={{ flex: 1, px: { xs: 2, md: 3 }, py: 2.5, maxWidth: 1400, mx: 'auto', width: '100%' }}>

        {/* Título */}
        <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: '0.62rem', color: 'text.secondary', letterSpacing: '0.1em', textTransform: 'uppercase', mb: 0.25 }}>
              // chamados
            </Typography>
            <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
              Chamados
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={lastUpdated ? `Atualizado: ${lastUpdated.toLocaleTimeString('pt-BR')}` : 'Atualizar'}>
              <span>
                <IconButton
                  onClick={() => load(true)}
                  disabled={refreshing || loading}
                  size="small"
                  sx={{
                    color: 'text.secondary',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '3px',
                    width: 34, height: 34,
                    '&:hover': { borderColor: COLORS.accent2, color: COLORS.accent2 },
                    '& svg': { animation: refreshing ? 'spin 1s linear infinite' : 'none' },
                    '@keyframes spin': { to: { transform: 'rotate(360deg)' } },
                  }}
                >
                  <RefreshIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </span>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setModalOpen(true)}
              disabled={glpiConfigured === false}
              sx={{ height: 34, fontSize: '0.78rem', px: 2 }}
            >
              Novo chamado
            </Button>
          </Box>
        </Box>

        {/* GLPI não configurado */}
        {glpiConfigured === false && (
          <Alert severity="warning" sx={{ mb: 3, fontSize: '0.85rem' }}>
            <strong>GLPI não conectado.</strong> {glpiMessage}<br />
            Configure as variáveis <code>GLPI_URL</code>, <code>GLPI_APP_TOKEN</code> e <code>GLPI_USER_TOKEN</code> no arquivo <code>backend/.env</code> e reinicie o servidor.
          </Alert>
        )}

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* KPIs */}
        {glpiConfigured !== false && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
              gap: 2,
              mb: 3,
            }}
          >
            <KpiCard
              label="Total"
              value={loading ? '—' : String(total)}
              icon={<ConfirmationNumberOutlinedIcon />}
              color={COLORS.accent2}
            />
            <KpiCard
              label="Novos"
              value={loading ? '—' : String(novos)}
              icon={<FiberNewOutlinedIcon />}
              color={COLORS.accent2}
              sub="aguardando atendimento"
            />
            <KpiCard
              label="Em andamento"
              value={loading ? '—' : String(emAndamento)}
              icon={<PendingOutlinedIcon />}
              color={COLORS.warn}
              sub="em processamento"
            />
            <KpiCard
              label="Resolvidos"
              value={loading ? '—' : String(resolvidos)}
              icon={<CheckCircleOutlineIcon />}
              color={COLORS.accent}
              sub="resolvidos ou fechados"
            />
          </Box>
        )}

        {/* Filtro de status */}
        {glpiConfigured !== false && !loading && tickets.length > 0 && (
          <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label="Todos"
              size="small"
              onClick={() => setFilterStatus('')}
              sx={{
                cursor: 'pointer',
                background: filterStatus === '' ? `${COLORS.accent2}20` : 'transparent',
                color: filterStatus === '' ? COLORS.accent2 : 'text.secondary',
                border: `1px solid ${filterStatus === '' ? COLORS.accent2 : COLORS.border}`,
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.65rem',
              }}
            />
            {Object.entries(GLPI_STATUS).map(([k, v]) => {
              const count = tickets.filter((t) => t.status === Number(k)).length;
              if (count === 0) return null;
              return (
                <Chip
                  key={k}
                  label={`${v.label} (${count})`}
                  size="small"
                  onClick={() => setFilterStatus(filterStatus === Number(k) ? '' : Number(k))}
                  sx={{
                    cursor: 'pointer',
                    background: filterStatus === Number(k) ? `${v.color}20` : 'transparent',
                    color: filterStatus === Number(k) ? v.color : 'text.secondary',
                    border: `1px solid ${filterStatus === Number(k) ? v.color : COLORS.border}`,
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '0.65rem',
                  }}
                />
              );
            })}
          </Box>
        )}

        {/* Tabela de chamados */}
        {glpiConfigured !== false && !loading && (
          <TableContainer component={Paper} sx={{ background: COLORS.surface }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 60 }}>#</TableCell>
                  <TableCell>Título</TableCell>
                  <TableCell sx={{ width: 140 }}>Status</TableCell>
                  <TableCell sx={{ width: 120 }}>Prioridade</TableCell>
                  <TableCell sx={{ width: 160 }}>Aberto em</TableCell>
                  <TableCell sx={{ width: 160 }}>Última atualização</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary', fontStyle: 'italic' }}>
                      Nenhum chamado encontrado.
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((t) => (
                  <TableRow
                    key={t.id}
                    hover
                    sx={{
                      cursor: 'default',
                      '&:hover': { background: `${COLORS.surface2}` },
                    }}
                  >
                    <TableCell sx={{ fontFamily: "'Space Mono', monospace", fontSize: '0.7rem', color: 'text.secondary' }}>
                      #{t.id}
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, lineHeight: 1.3 }}>
                        {t.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={t.status} />
                    </TableCell>
                    <TableCell>
                      <PriorityChip priority={t.priority} />
                    </TableCell>
                    <TableCell sx={{ fontFamily: "'Space Mono', monospace", fontSize: '0.68rem', color: 'text.secondary' }}>
                      {formatDate(t.date_creation || t.date)}
                    </TableCell>
                    <TableCell sx={{ fontFamily: "'Space Mono', monospace", fontSize: '0.68rem', color: 'text.secondary' }}>
                      {formatDate(t.date_mod)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {loading && glpiConfigured !== false && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={32} sx={{ color: COLORS.accent2 }} />
          </Box>
        )}
      </Box>

      <NewTicketModal
        open={modalOpen}
        categories={categories}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
      />
    </Box>
  );
}
