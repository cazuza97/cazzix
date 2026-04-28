import { useState, KeyboardEvent } from 'react';
import {
  Box, Paper, Typography, TextField, Button,
  Alert, CircularProgress, Divider,
} from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { apiLogin } from '@/api/zabbix';
import { COLORS } from '@/theme/theme';

export function LoginPage() {
  const { login } = useAuth();
  const [user, setUser]         = useState('Admin');
  const [pass, setPass]         = useState('');
  const [url, setUrl]           = useState('http://localhost:8080');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleLogin = async () => {
    if (!url.trim()) { setError('Informe a URL do Zabbix'); return; }
    setLoading(true);
    setError(null);
    try {
      const token = await apiLogin(url.trim().replace(/\/$/, ''), user, pass);
      login({ token, zabbixUrl: url.trim().replace(/\/$/, ''), user, demoMode: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao conectar. Verifique URL e credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    login({ token: '', zabbixUrl: '', user: 'demo', demoMode: true });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        px: 2,
        // Subtle grid background
        backgroundImage: `
          linear-gradient(${COLORS.border} 1px, transparent 1px),
          linear-gradient(90deg, ${COLORS.border} 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
        '&::before': {
          content: '""',
          position: 'fixed', inset: 0, zIndex: 0,
          background: `radial-gradient(ellipse 70% 70% at 50% 50%, ${COLORS.bg}aa 0%, ${COLORS.bg} 70%)`,
        },
      }}
    >
      {/* Green glow */}
      <Box sx={{
        position: 'fixed',
        width: 500, height: 500,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${COLORS.accent}09 0%, transparent 70%)`,
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <Paper
        elevation={0}
        sx={{
          position: 'relative', zIndex: 1,
          width: '100%', maxWidth: 420,
          p: 4,
          boxShadow: `0 0 60px ${COLORS.accent}06, 0 32px 80px rgba(0,0,0,0.6)`,
        }}
      >
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 0.75 }}>
          <Box sx={{
            width: 34, height: 34,
            background: COLORS.accent,
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Box component="svg" viewBox="0 0 24 24" sx={{ width: 16, height: 16, fill: COLORS.bg }}>
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </Box>
          </Box>
          <Typography sx={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Zabbix<Box component="span" sx={{ color: COLORS.accent }}>View</Box>
          </Typography>
        </Box>

        <Typography
          sx={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.65rem',
            color: 'text.secondary',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            mb: 3,
          }}
        >
          // Monitoramento de Infraestrutura
        </Typography>

        {/* Fields */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Usuário"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            onKeyDown={handleKeyDown}
            fullWidth
            size="small"
            autoComplete="username"
          />
          <TextField
            label="Senha"
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={handleKeyDown}
            fullWidth
            size="small"
            autoComplete="current-password"
          />
          <TextField
            label="URL do Zabbix"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            fullWidth
            size="small"
            placeholder="http://localhost:8080"
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2, fontFamily: "'Space Mono', monospace", fontSize: '0.75rem' }}>
            {error}
          </Alert>
        )}

        <Button
          variant="contained"
          fullWidth
          onClick={handleLogin}
          disabled={loading}
          sx={{ mt: 2.5, py: 1.1, fontSize: '0.9rem' }}
        >
          {loading ? <CircularProgress size={18} sx={{ color: COLORS.bg }} /> : 'Entrar'}
        </Button>

        <Divider sx={{ my: 2.5, borderColor: COLORS.border }}>
          <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', color: 'text.secondary', px: 1 }}>
            ou
          </Typography>
        </Divider>

        <Button
          variant="outlined"
          fullWidth
          onClick={handleDemo}
          sx={{
            borderColor: COLORS.border,
            color: 'text.secondary',
            fontSize: '0.8rem',
            '&:hover': { borderColor: COLORS.accent, color: COLORS.accent },
          }}
        >
          Usar modo demo
        </Button>

        <Typography
          sx={{
            mt: 2.5,
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.62rem',
            color: 'text.secondary',
            textAlign: 'center',
            lineHeight: 1.8,
          }}
        >
          O backend Node.js atua como proxy — sem CORS.<br />
          Deixe a senha em branco para dados locais via demo.
        </Typography>
      </Paper>
    </Box>
  );
}
