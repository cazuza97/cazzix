import {
  AppBar, Toolbar, Box, Typography, Chip,
  Button, Select, MenuItem, FormControl, SelectChangeEvent,
  IconButton, Tooltip,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import LogoutIcon from '@mui/icons-material/Logout';
import { COLORS } from '@/theme/theme';
import { ZabbixGroup } from '@/types';

interface AppHeaderProps {
  user: string;
  isDemo: boolean;
  zabbixUrl: string;
  groups: ZabbixGroup[];
  selectedGroup: string;
  onGroupChange: (g: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
  onLogout: () => void;
  lastUpdated: Date | null;
}

export function AppHeader({
  user, isDemo, zabbixUrl, groups,
  selectedGroup, onGroupChange,
  onRefresh, refreshing, onLogout, lastUpdated,
}: AppHeaderProps) {
  const handleGroupChange = (e: SelectChangeEvent) => onGroupChange(e.target.value);

  const origin = zabbixUrl
    ? (() => { try { return new URL(zabbixUrl).host; } catch { return zabbixUrl; } })()
    : 'demo';

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: COLORS.surface,
        borderBottom: `1px solid ${COLORS.border}`,
        backdropFilter: 'blur(8px)',
      }}
    >
      <Toolbar sx={{ gap: 2, minHeight: { xs: 56, sm: 64 } }}>

        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexShrink: 0 }}>
          <Box sx={{
            width: 28, height: 28,
            background: COLORS.accent,
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Box component="svg" viewBox="0 0 24 24" sx={{ width: 14, height: 14, fill: COLORS.bg }}>
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </Box>
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em' }}>
            Zabbix<Box component="span" sx={{ color: COLORS.accent }}>View</Box>
          </Typography>
        </Box>

        {/* Connection dot */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box sx={{
            width: 7, height: 7, borderRadius: '50%',
            background: COLORS.accent,
            boxShadow: `0 0 8px ${COLORS.accent}`,
            animation: 'pulse 2s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.35 },
            },
          }} />
          <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', color: 'text.secondary' }}>
            {origin}
          </Typography>
        </Box>

        {isDemo && (
          <Chip
            label="DEMO"
            size="small"
            sx={{
              background: `${COLORS.warn}20`,
              color: COLORS.warn,
              border: `1px solid ${COLORS.warn}40`,
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.6rem',
              height: 22,
            }}
          />
        )}

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Group filter */}
        {groups.length > 0 && (
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              value={selectedGroup}
              onChange={handleGroupChange}
              displayEmpty
              sx={{
                fontSize: '0.75rem',
                height: 34,
                '.MuiOutlinedInput-notchedOutline': { borderColor: COLORS.border },
              }}
            >
              <MenuItem value="" sx={{ fontFamily: "'Space Mono', monospace", fontSize: '0.75rem' }}>
                Todos os grupos
              </MenuItem>
              {groups.map((g) => (
                <MenuItem key={g.groupid} value={g.name} sx={{ fontFamily: "'Space Mono', monospace", fontSize: '0.75rem' }}>
                  {g.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Refresh */}
        <Tooltip title={lastUpdated ? `Atualizado: ${lastUpdated.toLocaleTimeString('pt-BR')}` : 'Atualizar'}>
          <span>
            <IconButton
              onClick={onRefresh}
              disabled={refreshing}
              size="small"
              sx={{
                color: 'text.secondary',
                border: `1px solid ${COLORS.border}`,
                borderRadius: '3px',
                width: 34, height: 34,
                '&:hover': { borderColor: COLORS.accent, color: COLORS.accent },
                '& svg': { animation: refreshing ? 'spin 1s linear infinite' : 'none' },
                '@keyframes spin': { to: { transform: 'rotate(360deg)' } },
              }}
            >
              <RefreshIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </span>
        </Tooltip>

        {/* User + logout */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.2 }}>{user}</Typography>
            <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', color: 'text.secondary' }}>
              {isDemo ? 'modo demo' : origin}
            </Typography>
          </Box>
          <Button
            startIcon={<LogoutIcon sx={{ fontSize: '14px !important' }} />}
            onClick={onLogout}
            size="small"
            sx={{
              color: 'text.secondary',
              border: `1px solid ${COLORS.border}`,
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.65rem',
              px: 1, py: 0.5,
              minWidth: 'auto',
              '&:hover': { borderColor: COLORS.danger, color: COLORS.danger },
            }}
          >
            Sair
          </Button>
        </Box>

      </Toolbar>
    </AppBar>
  );
}
