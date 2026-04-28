import { Paper, Typography, Box } from '@mui/material';
import { ReactNode } from 'react';

interface KpiCardProps {
  label: string;
  value: number | string;
  sub: string;
  color: string;
  icon: ReactNode;
}

export function KpiCard({ label, value, sub, color, icon }: KpiCardProps) {
  return (
    <Paper
      sx={{
        p: 2.5,
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s, border-color 0.2s',
        '&:hover': { transform: 'translateY(-2px)', borderColor: '#2a3040' },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: '2px',
          background: color,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', lineHeight: 1.4 }}
        >
          {label}
        </Typography>
        <Box sx={{ color, opacity: 0.7 }}>{icon}</Box>
      </Box>

      <Typography
        sx={{
          fontSize: '2.2rem',
          fontWeight: 800,
          lineHeight: 1,
          color,
          fontFamily: '"Syne", sans-serif',
          mb: 0.5,
        }}
      >
        {value}
      </Typography>

      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
        {sub}
      </Typography>
    </Paper>
  );
}
