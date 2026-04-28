import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00e5a0',
      contrastText: '#0a0c10',
    },
    secondary: {
      main: '#0099ff',
    },
    error: {
      main: '#ff4b4b',
    },
    warning: {
      main: '#ffb800',
    },
    success: {
      main: '#00e5a0',
    },
    background: {
      default: '#0a0c10',
      paper: '#10131a',
    },
    text: {
      primary: '#e2e8f0',
      secondary: '#5a6484',
    },
    divider: '#1f2535',
  },
  typography: {
    fontFamily: '"Syne", sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    body1: { fontFamily: '"Syne", sans-serif' },
    body2: { fontFamily: '"Space Mono", monospace', fontSize: '0.75rem' },
    caption: { fontFamily: '"Space Mono", monospace', fontSize: '0.65rem', letterSpacing: '0.08em' },
    overline: { fontFamily: '"Space Mono", monospace', fontSize: '0.65rem', letterSpacing: '0.12em' },
  },
  shape: {
    borderRadius: 3,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #1f2535',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontFamily: '"Space Mono", monospace',
            fontSize: '0.65rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#5a6484',
            borderBottom: '1px solid #1f2535',
            backgroundColor: '#161b26',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(31,37,53,0.5)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: '"Space Mono", monospace',
          fontSize: '0.65rem',
          fontWeight: 700,
          letterSpacing: '0.05em',
          height: 22,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: '"Syne", sans-serif',
          fontWeight: 700,
          letterSpacing: '0.03em',
          textTransform: 'none',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontFamily: '"Space Mono", monospace',
          fontSize: '0.85rem',
          '& fieldset': { borderColor: '#1f2535' },
          '&:hover fieldset': { borderColor: '#2a3040 !important' },
          '&.Mui-focused fieldset': { borderColor: '#00e5a0 !important' },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontFamily: '"Space Mono", monospace',
          fontSize: '0.78rem',
          letterSpacing: '0.05em',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          fontFamily: '"Space Mono", monospace',
          fontSize: '0.78rem',
        },
      },
    },
  },
});
