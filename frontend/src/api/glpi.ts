import { GlpiTicket, GlpiCategory, GlpiStatus, GlpiTicketLog, CreateTicketPayload } from '@/types/glpi';

const BASE = `${window.location.protocol}//${window.location.hostname}:3001/api/glpi`;

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `Erro ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/** Verifica se o GLPI está configurado e acessível */
export async function fetchGlpiStatus(): Promise<GlpiStatus> {
  const res = await fetch(`${BASE}/status`);
  return res.json();
}

/** Lista tickets (últimos 100, ordenados por data de modificação) */
export async function fetchTickets(): Promise<GlpiTicket[]> {
  const res = await fetch(`${BASE}/tickets`);
  const data = await handleResponse<GlpiTicket[] | { error: string }>(res);
  // GLPI retorna array ou objeto com error
  if (!Array.isArray(data)) return [];
  return data;
}

/** Busca detalhe de um ticket */
export async function fetchTicket(id: number): Promise<{ ticket: GlpiTicket; logs: GlpiTicketLog[] }> {
  const res = await fetch(`${BASE}/tickets/${id}`);
  return handleResponse(res);
}

/** Cria novo ticket */
export async function createTicket(payload: CreateTicketPayload): Promise<{ id: number }> {
  const res = await fetch(`${BASE}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

/** Atualiza status de um ticket */
export async function updateTicketStatus(
  id: number,
  status: number,
  solution?: string
): Promise<unknown> {
  const res = await fetch(`${BASE}/tickets/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, ...(solution ? { solution } : {}) }),
  });
  return handleResponse(res);
}

/** Lista categorias disponíveis */
export async function fetchCategories(): Promise<GlpiCategory[]> {
  const res = await fetch(`${BASE}/categories`);
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data;
}

export type { GlpiTicketLog };
