import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { zabbixRouter } from './routes/zabbix';
import { demoRouter } from './routes/demo';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// ─── Routes ──────────────────────────────────────
app.use('/api/zabbix', zabbixRouter);
app.use('/api/demo', demoRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Start ───────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🟢 ZabbixView backend running on http://localhost:${PORT}`);
  console.log(`   Proxy pronto para encaminhar chamadas ao Zabbix\n`);
});
