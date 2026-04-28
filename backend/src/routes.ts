import { Router, Request, Response } from 'express';
import { zabbixCall } from './zabbix.service';
import { LoginRequest, ProxyRequest } from './types';

const router = Router();

// ─── POST /api/login ─────────────────────────────────────────────────────────
// Faz login no Zabbix e devolve o token de autenticação
router.post('/login', async (req: Request, res: Response) => {
  const { zabbixUrl, user, password } = req.body as LoginRequest;

  if (!zabbixUrl || !user || !password) {
    return res.status(400).json({ error: 'zabbixUrl, user e password são obrigatórios' });
  }

  try {
    const token = await zabbixCall<string>(
      zabbixUrl,
      'user.login',
      { user, password },
      null
    );
    return res.json({ token, zabbixUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return res.status(401).json({ error: message });
  }
});

// ─── POST /api/proxy ──────────────────────────────────────────────────────────
// Proxy genérico: recebe method + params, repassa ao Zabbix com o token
router.post('/proxy', async (req: Request, res: Response) => {
  const { zabbixUrl, token, method, params } = req.body as ProxyRequest;

  if (!zabbixUrl || !token || !method) {
    return res.status(400).json({ error: 'zabbixUrl, token e method são obrigatórios' });
  }

  try {
    const result = await zabbixCall(zabbixUrl, method, params ?? {}, token);
    return res.json({ result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return res.status(502).json({ error: message });
  }
});

// ─── GET /api/health ──────────────────────────────────────────────────────────
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
