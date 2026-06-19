// ─── Status ─────────────────────────────────────────────────────────────────
export const GLPI_STATUS: Record<number, { label: string; color: string }> = {
  1: { label: 'Novo',            color: '#0099ff' },
  2: { label: 'Em andamento',    color: '#ffb800' },
  3: { label: 'Em andamento',    color: '#ffb800' },
  4: { label: 'Pendente',        color: '#5a6484' },
  5: { label: 'Resolvido',       color: '#00e5a0' },
  6: { label: 'Fechado',         color: '#374151' },
};

// ─── Priority ────────────────────────────────────────────────────────────────
export const GLPI_PRIORITY: Record<number, { label: string; color: string }> = {
  1: { label: 'Muito baixa', color: '#5a6484' },
  2: { label: 'Baixa',       color: '#0099ff' },
  3: { label: 'Média',       color: '#ffb800' },
  4: { label: 'Alta',        color: '#ff8c00' },
  5: { label: 'Muito alta',  color: '#ff4b4b' },
  6: { label: 'Crítica',     color: '#cc0000' },
};

// ─── Interfaces ──────────────────────────────────────────────────────────────
export interface GlpiTicket {
  id: number;
  name: string;
  content: string;
  status: number;
  priority: number;
  date: string;
  date_mod: string;
  date_creation: string;
  /** Expandido: nome do grupo de usuários requerente */
  requesttypes_id: number | string;
  /** Expandido: nome da categoria */
  itilcategories_id: number | string;
  /** Usuário que abriu */
  users_id_recipient: number | string;
  /** Usuário atribuído (pode vir como string quando expand_dropdowns=true) */
  users_id_assign?: number | string;
  /** Tempo de solução em segundos */
  time_to_resolve?: string;
  solution?: string;
}

export interface GlpiCategory {
  id: number;
  name: string;
  completename: string;
}

export interface GlpiTicketLog {
  id: number;
  date_mod: string;
  user_name: string;
  field: string;
  content: string;
}

export interface GlpiStatus {
  configured: boolean;
  url?: string;
  message?: string;
}

export interface CreateTicketPayload {
  name: string;
  content: string;
  priority?: number;
  itilcategories_id?: number;
}
