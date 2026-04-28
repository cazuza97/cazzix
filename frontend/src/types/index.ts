// ─── Zabbix entities ─────────────────────────────────────────────────────────

export interface ZabbixHost {
  hostid: string;
  name: string;
  host: string;
  status: '0' | '1';       // 0 = enabled, 1 = disabled
  available: '0' | '1' | '2'; // 0 = unknown, 1 = ok, 2 = unavailable
  interfaces: Array<{ ip: string }>;
  groups: Array<{ name: string }>;
}

export interface ZabbixProblem {
  eventid: string;
  name: string;
  hostid: string;
  clock: number;   // unix timestamp
  severity: '0' | '1' | '2' | '3' | '4' | '5';
}

export interface ZabbixGroup {
  groupid: string;
  name: string;
}

// ─── App state ───────────────────────────────────────────────────────────────

export interface AuthState {
  token: string;
  zabbixUrl: string;
  user: string;
  demoMode: boolean;
}

export type HostStatus = 'ok' | 'problem' | 'disabled' | 'unknown';

export interface DashboardData {
  hosts: ZabbixHost[];
  problems: ZabbixProblem[];
  groups: ZabbixGroup[];
}

// ─── Severity helpers ─────────────────────────────────────────────────────────

export const SEVERITY_LABEL: Record<string, string> = {
  '5': 'DISASTER',
  '4': 'HIGH',
  '3': 'AVERAGE',
  '2': 'WARNING',
  '1': 'INFO',
  '0': 'UNDEFINED',
};

export const SEVERITY_COLOR: Record<string, string> = {
  '5': '#ff2020',
  '4': '#ff4b4b',
  '3': '#ffb800',
  '2': '#ff9500',
  '1': '#0099ff',
  '0': '#5a6484',
};
