import { useState, useMemo } from 'react';
import {
  Box, Grid, Typography, Alert, LinearProgress,
} from '@mui/material';
import DnsIcon from '@mui/icons-material/Dns';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useDashboard';
import { AppHeader } from '@/components/AppHeader';
import { KpiCard } from '@/components/KpiCard';
import { HostsTable } from '@/components/HostsTable';
import { ProblemsList } from '@/components/ProblemsList';
import { BarChart } from '@/components/BarChart';
import { COLORS } from '@/theme/theme';

export function DashboardPage() {
  const { auth, logout } = useAuth();
  const { data, loading, error, refresh, lastUpdated } = useDashboard();
  const [selectedGroup, setSelectedGroup] = useState('');

  // Filter hosts by group
  const filteredHosts = useMemo(() => {
    if (!data) return [];
    if (!selectedGroup) return data.hosts;
    return data.hosts.filter((h) => h.groups?.some((g) => g.name === selectedGroup));
  }, [data, selectedGroup]);

  // Filter problems to match visible hosts
  const filteredProblems = useMemo(() => {
    if (!data) return [];
    const ids = new Set(filteredHosts.map((h) => h.hostid));
    return data.problems.filter((p) => ids.has(p.hostid));
  }, [data, filteredHosts]);

  // KPI values
  const kpiOk       = filteredHosts.filter((h) => h.status === '0' && h.available === '1').length;
  const kpiProblem  = filteredHosts.filter((h) => h.available === '2').length;
  const kpiTotal    = filteredHosts.length;
  const kpiAlerts   = filteredProblems.length;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: COLORS.bg }}>
      <AppHeader
        user={auth?.user ?? ''}
        isDemo={auth?.demoMode ?? false}
        zabbixUrl={auth?.zabbixUrl ?? ''}
        groups={data?.groups ?? []}
        selectedGroup={selectedGroup}
        onGroupChange={setSelectedGroup}
        onRefresh={refresh}
        refreshing={loading}
        onLogout={logout}
        lastUpdated={lastUpdated}
      />

      {/* Loading bar */}
      {loading && (
        <LinearProgress
          sx={{
            height: 2,
            background: COLORS.surface2,
            '& .MuiLinearProgress-bar': { background: COLORS.accent },
          }}
        />
      )}

      <Box sx={{ flex: 1, px: { xs: 2, md: 3 }, py: 2.5, maxWidth: 1400, mx: 'auto', width: '100%' }}>

        {/* Toolbar title */}
        <Box sx={{ mb: 2.5 }}>
          <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: '0.62rem', color: 'text.secondary', letterSpacing: '0.1em', textTransform: 'uppercase', mb: 0.25 }}>
            // visão geral
          </Typography>
          <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
            Infraestrutura
          </Typography>
        </Box>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2, fontFamily: "'Space Mono', monospace", fontSize: '0.75rem' }}>
            {error}
          </Alert>
        )}

        {/* KPI Cards */}
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid item xs={6} sm={3}>
            <KpiCard
              label="Hosts OK"
              value={loading ? '—' : kpiOk}
              sub="sem problemas"
              color={COLORS.accent}
              icon={<CheckCircleOutlineIcon sx={{ fontSize: 20 }} />}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <KpiCard
              label="Com Problema"
              value={loading ? '—' : kpiProblem}
              sub="requerem atenção"
              color={COLORS.danger}
              icon={<WarningAmberIcon sx={{ fontSize: 20 }} />}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <KpiCard
              label="Total de Hosts"
              value={loading ? '—' : kpiTotal}
              sub="monitorados"
              color={COLORS.accent2}
              icon={<DnsIcon sx={{ fontSize: 20 }} />}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <KpiCard
              label="Alertas Ativos"
              value={loading ? '—' : kpiAlerts}
              sub="em aberto"
              color={COLORS.warn}
              icon={<NotificationsActiveIcon sx={{ fontSize: 20 }} />}
            />
          </Grid>
        </Grid>

        {/* Main panels */}
        <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
          <Grid item xs={12} md={7}>
            <HostsTable hosts={filteredHosts} loading={loading} />
          </Grid>
          <Grid item xs={12} md={5}>
            <ProblemsList problems={filteredProblems} hosts={filteredHosts} loading={loading} />
          </Grid>
        </Grid>

        {/* Bar chart */}
        <BarChart hosts={filteredHosts} problems={filteredProblems} />

      </Box>
    </Box>
  );
}
