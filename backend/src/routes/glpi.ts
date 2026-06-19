import { Router, Request, Response } from 'express';
import { glpiGet, glpiPost, glpiPatch } from '../glpi.service';
import { AxiosError } from 'axios';

export const glpiRouter = Router();

// Status GLPI: 1=Novo, 2=Em processamento(atribuído), 3=Em processamento(planejado),
//              4=Pendente, 5=Resolvido, 6=Fechado
// Prioridade:  1=Muito baixa, 2=Baixa, 3=Média, 4=Alta, 5=Muito alta, 6=Maior

function handleError(res: Response, err: unknown, context: string) {
  const axErr = err as AxiosError;
  const status = axErr.response?.status ?? 500;
  const data   = axErr.response?.data;
  const msg    = data
    ? JSON.stringify(data)
    : (err instanceof Error ? err.message : 'Erro desconhecido');
  console.error(`[GLPI] ✗ ${context} → ${msg}`);
  res.status(status >= 400 ? status : 502).json({ error: msg });
}

// ─── GET /api/glpi/tickets ──────────────────────────────────────────────────
// Lista todos os tickets com campos resumidos
glpiRouter.get('/tickets', async (_req: Request, res: Response) => {
  try {
    const tickets = await glpiGet('/Ticket', {
      range: '0-99',
      'expand_dropdowns': true,
      'with_logs': false,
      sort: 'date_mod',
      order: 'DESC',
    });
    res.json(tickets);
  } catch (err) {
    handleError(res, err, 'GET /tickets');
  }
});

// ─── GET /api/glpi/tickets/:id ──────────────────────────────────────────────
// Detalhe completo de um ticket
glpiRouter.get('/tickets/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [ticket, logs] = await Promise.all([
      glpiGet(`/Ticket/${id}`, { expand_dropdowns: true }),
      glpiGet(`/Ticket/${id}/Log`, { expand_dropdowns: true }).catch(() => []),
    ]);
    res.json({ ticket, logs });
  } catch (err) {
    handleError(res, err, `GET /tickets/${id}`);
  }
});

// ─── POST /api/glpi/tickets ─────────────────────────────────────────────────
// Cria novo ticket
// Body: { name, content, priority?, itilcategories_id?, _users_id_requester? }
glpiRouter.post('/tickets', async (req: Request, res: Response) => {
  const { name, content, priority = 3, itilcategories_id, _users_id_requester } = req.body;

  if (!name || !content) {
    res.status(400).json({ error: '"name" e "content" são obrigatórios' });
    return;
  }

  try {
    const result = await glpiPost('/Ticket', {
      input: {
        name,
        content,
        priority,
        status: 1, // Novo
        type: 1,   // Incidente
        ...(itilcategories_id ? { itilcategories_id } : {}),
        ...(_users_id_requester ? { _users_id_requester } : {}),
      },
    });
    res.status(201).json(result);
  } catch (err) {
    handleError(res, err, 'POST /tickets');
  }
});

// ─── PATCH /api/glpi/tickets/:id ────────────────────────────────────────────
// Atualiza status ou outros campos de um ticket
// Body: { status?, solution?, assigned_user_id? }
glpiRouter.patch('/tickets/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, solution } = req.body;

  if (!status && !solution) {
    res.status(400).json({ error: 'Informe ao menos "status" ou "solution"' });
    return;
  }

  try {
    const input: Record<string, unknown> = { id: Number(id) };
    if (status)   input.status   = status;
    if (solution) input.solution = solution;

    const result = await glpiPatch(`/Ticket/${id}`, { input });
    res.json(result);
  } catch (err) {
    handleError(res, err, `PATCH /tickets/${id}`);
  }
});

// ─── GET /api/glpi/categories ───────────────────────────────────────────────
// Lista categorias de chamados (para o formulário de criação)
glpiRouter.get('/categories', async (_req: Request, res: Response) => {
  try {
    const cats = await glpiGet('/ITILCategory', { range: '0-99', expand_dropdowns: true });
    res.json(cats);
  } catch (err) {
    handleError(res, err, 'GET /categories');
  }
});

// ─── GET /api/glpi/status ───────────────────────────────────────────────────
// Verifica se o GLPI está configurado e acessível
glpiRouter.get('/status', async (_req: Request, res: Response) => {
  try {
    if (!process.env.GLPI_URL || !process.env.GLPI_APP_TOKEN || !process.env.GLPI_USER_TOKEN) {
      res.json({ configured: false, message: 'Variáveis GLPI_* não definidas no .env' });
      return;
    }
    await glpiGet('/getMyProfiles');
    res.json({ configured: true, url: process.env.GLPI_URL });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao conectar ao GLPI';
    res.json({ configured: false, message: msg });
  }
});
