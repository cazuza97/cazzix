// ─── Zabbix API types ────────────────────────────────────────────────────────

export interface ZabbixRequest {
  method: string;
  params: Record<string, unknown>;
  auth?: string | null;
}

export interface ZabbixResponse<T = unknown> {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data: string;
  };
}

export interface LoginRequest {
  zabbixUrl: string;
  user: string;
  password: string;
}

export interface ProxyRequest {
  zabbixUrl: string;
  token: string;
  method: string;
  params: Record<string, unknown>;
}
