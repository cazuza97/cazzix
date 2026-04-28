import axios, { AxiosError } from 'axios';
import { ZabbixHost, ZabbixProblem, ZabbixGroup, DashboardData } from '@/types';

const BASE_URL = 'http://localhost:3001/api';

function extractError(err: unknown): string {
  const axErr = err as AxiosError<{ error?: string }>;
  if (axErr.isAxiosError) {
    const serverMsg = axErr.response?.data?.error;
    if (serverMsg) return serverMsg;
    return axErr.message;
  }
  if (err instanceof Error) return err.message;
  return 'Erro desconhecido';
}

// ─── Generic proxy call ───────────────────────────────────────────────────────
async function proxy<T>(
  zabbixUrl: string,
  token: string,
  method: string,
  params: Record<string, unknown>
): Promise<T> {
  try {
    const { data } = await axios.post(`${BASE_URL}/zabbix/call`, {
      zabbixUrl,
      auth: token,   // backend repassa como Bearer header para o Zabbix 7
      method,
      params,
    });
    if (data.error) throw new Error(data.error);
    return data.result as T;
  } catch (err) {
    throw new Error(extractError(err));
  }
}

// ─── Login ────────────────────────────────────────────────────────────────────
// Zabbix 7.x usa "username" (não "user")
export async function apiLogin(
  zabbixUrl: string,
  user: string,
  password: string
): Promise<string> {
  try {
    const { data } = await axios.post(`${BASE_URL}/zabbix/call`, {
      zabbixUrl,
      method: 'user.login',
      params: { username: user, password },
      auth: null,
    });
    if (data.error) throw new Error(data.error as string);
    return data.result as string;
  } catch (err) {
    throw new Error(extractError(err));
  }
}

// ─── Hosts ────────────────────────────────────────────────────────────────────
export async function fetchHosts(zabbixUrl: string, token: string): Promise<ZabbixHost[]> {
  return proxy<ZabbixHost[]>(zabbixUrl, token, 'host.get', {
    output: ['hostid', 'host', 'name', 'status', 'available'],
    selectInterfaces: ['ip'],
    selectGroups: ['name'],
    limit: 200,
  });
}

// ─── Problems ─────────────────────────────────────────────────────────────────
export async function fetchProblems(zabbixUrl: string, token: string): Promise<ZabbixProblem[]> {
  return proxy<ZabbixProblem[]>(zabbixUrl, token, 'problem.get', {
    output: 'extend',
    recent: true,
    severities: [1, 2, 3, 4, 5],
    limit: 100,
  });
}

// ─── Groups ───────────────────────────────────────────────────────────────────
export async function fetchGroups(zabbixUrl: string, token: string): Promise<ZabbixGroup[]> {
  return proxy<ZabbixGroup[]>(zabbixUrl, token, 'hostgroup.get', {
    output: ['groupid', 'name'],
  });
}

// ─── Demo data (via backend) ──────────────────────────────────────────────────
export async function fetchDemoData(): Promise<DashboardData> {
  const { data } = await axios.get(`${BASE_URL}/demo/data`);
  return data as DashboardData;
}

// ─── Fallback demo (local) ────────────────────────────────────────────────────
export function getDemoData(): DashboardData {
  const now = Math.floor(Date.now() / 1000);
  return {
    hosts: [
      { hostid: '1', name: 'web-server-01',  host: 'web-01',  status: '0', available: '1', interfaces: [{ ip: '192.168.1.10' }], groups: [{ name: 'Servidores Web' }] },
      { hostid: '2', name: 'db-server-01',   host: 'db-01',   status: '0', available: '1', interfaces: [{ ip: '192.168.1.11' }], groups: [{ name: 'Banco de Dados' }] },
      { hostid: '3', name: 'app-server-02',  host: 'app-02',  status: '0', available: '2', interfaces: [{ ip: '192.168.1.12' }], groups: [{ name: 'Aplicação' }] },
    ],
    problems: [
      { eventid: '101', name: 'CPU usage is too high', hostid: '2', clock: now - 3600, severity: '3' },
    ],
    groups: [
      { groupid: '1', name: 'Servidores Web' },
      { groupid: '2', name: 'Banco de Dados' },
      { groupid: '3', name: 'Aplicação' },
    ],
  };
}

// ─── Items (valores atuais de métricas) ──────────────────────────────────────
export interface ZabbixItem {
  itemid: string;
  name: string;
  key_: string;
  lastvalue: string;
  lastclock: string;
  units: string;
  value_type: string; // 0=float, 3=unsigned int
}

export async function fetchItems(
  zabbixUrl: string,
  token: string,
  hostid: string,
  keys: string[]
): Promise<ZabbixItem[]> {
  return proxy<ZabbixItem[]>(zabbixUrl, token, 'item.get', {
    output: ['itemid', 'name', 'key_', 'lastvalue', 'lastclock', 'units', 'value_type'],
    hostids: [hostid],
    search: { key_: keys },
    searchByAny: true,
    monitored: true,
    limit: 100,
  });
}

// ─── History (séries temporais para gráficos) ─────────────────────────────────
export interface HistoryPoint {
  clock: string;
  value: string;
}

export async function fetchHistory(
  zabbixUrl: string,
  token: string,
  itemids: string[],
  valueType: number = 0,
  hours: number = 3
): Promise<HistoryPoint[]> {
  const timeFrom = Math.floor(Date.now() / 1000) - hours * 3600;
  return proxy<HistoryPoint[]>(zabbixUrl, token, 'history.get', {
    output: 'extend',
    itemids,
    history: valueType,
    time_from: timeFrom,
    sortfield: 'clock',
    sortorder: 'ASC',
    limit: 500,
  });
}
