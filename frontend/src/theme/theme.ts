import { createTheme } from '@mui/material/styles';

export const COLORS = {
  bg:       '#0a0c10',
  surface:  '#10131a',
  surface2: '#161b26',
  border:   '#1f2535',
  accent:   '#00e5a0',
  accent2:  '#0099ff',
  warn:     '#ffb800',
  danger:   '#ff4b4b',
  text:     '#e2e8f0',
  muted:    '#5a6484',
};

export const theme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: COLORS.bg, paper: COLORS.surface },
    primary:   { main: COLORS.accent,  contrastText: COLORS.bg },
    error:     { main: COLORS.danger },
    warning:   { main: COLORS.warn },
    info:      { main: COLORS.accent2 },
    success:   { main: COLORS.accent },
    text: {
      primary:   COLORS.text,
      secondary: COLORS.muted,
    },
    divider: COLORS.border,
  },
  typography: {
    fontFamily: "'Syne', sans-serif",
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 800 },
    h4: { fontWeight: 800 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 700, letterSpacing: '0.03em' },
  },
  shape: { borderRadius: 3 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 3,
          border: `1px solid ${COLORS.border}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontFamily: "'Syne', sans-serif", fontWeight: 700 },
        contained: { boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontFamily: "'Space Mono', monospace",
          fontSize: '0.875rem',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.border },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.muted },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.accent },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontFamily: "'Space Mono', monospace",
          fontSize: '0.75rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          '&.Mui-focused': { color: COLORS.accent },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontFamily: "'Space Mono', monospace",
          fontSize: '0.65rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: COLORS.muted,
          background: COLORS.surface2,
          borderBottom: `1px solid ${COLORS.border}`,
        },
        body: { borderBottom: `1px solid ${COLORS.border}44` },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', fontWeight: 700 },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: { fontFamily: "'Space Mono', monospace", fontSize: '0.8rem' },
      },
    },
  },
});
