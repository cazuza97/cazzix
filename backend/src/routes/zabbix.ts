import { Router, Request, Response } from 'express';
import axios, { AxiosError } from 'axios';

export const zabbixRouter = Router();

interface ZabbixCallBody {
  zabbixUrl: string;
  method: string;
  params?: Record<string, unknown>;
  auth?: string | null;
}

// ─── POST /api/zabbix/call ───────────────────────────────────────────────────
// Zabbix 7.x: autenticação APENAS via Authorization: Bearer header
// Sem "auth" no body — o Zabbix 7 rejeita se vier no body
zabbixRouter.post('/call', async (req: Request, res: Response) => {
  const { zabbixUrl, method, params = {}, auth = null }: ZabbixCallBody = req.body;

  if (!zabbixUrl || !method) {
    res.status(400).json({ error: 'zabbixUrl e method são obrigatórios' });
    return;
  }

  const apiUrl = `${zabbixUrl.replace(/\/$/, '')}/api_jsonrpc.php`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Zabbix 7.x: token vai SOMENTE no header Authorization
  if (auth) {
    headers['Authorization'] = `Bearer ${auth}`;
  }

  // Body nunca inclui "auth" — o Zabbix 7 não aceita
  const body = {
    jsonrpc: '2.0',
    id: 1,
    method,
    params,
  };

  console.log(`[Zabbix] → ${method}`);

  try {
    const { data } = await axios.post(apiUrl, body, { headers, timeout: 10000 });

    if (data.error) {
      const msg = data.error.data || data.error.message || JSON.stringify(data.error);
      console.error(`[Zabbix] ✗ ${method} → ${msg}`);
      res.status(400).json({ error: msg });
      return;
    }

    console.log(`[Zabbix] ✓ ${method}`);
    res.json({ result: data.result });

  } catch (err: unknown) {
    const axErr = err as AxiosError;
    if (axErr.isAxiosError) {
      const code = axErr.code ?? '';
      if (['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT'].includes(code)) {
        const msg = `Não foi possível conectar ao Zabbix em ${apiUrl} (${code})`;
        console.error(`[Zabbix] ✗ ${msg}`);
        res.status(502).json({ error: msg });
      } else {
        const respData = axErr.response?.data as Record<string, unknown> | undefined;
        const msg = respData ? JSON.stringify(respData) : axErr.message;
        console.error(`[Zabbix] ✗ ${msg}`);
        res.status(502).json({ error: msg });
      }
    } else {
      console.error('[Zabbix] ✗ erro desconhecido', err);
      res.status(500).json({ error: 'Erro interno no servidor' });
    }
  }
});
