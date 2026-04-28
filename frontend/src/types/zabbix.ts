export interface ZabbixHost {
  hostid: string;
  name: string;
  host: string;
  status: '0' | '1';         // 0=enabled, 1=disabled
  available: '0' | '1' | '2'; // 0=unknown, 1=available, 2=unavailable
  interfaces: { ip: string }[];
  groups: { name: string }[];
}

export interface ZabbixProblem {
  eventid: string;
  name: string;
  hostid: string;
  clock: number;
  severity: '0' | '1' | '2' | '3' | '4' | '5';
}

export interface ZabbixGroup {
  groupid: string;
  name: string;
}

export interface DashboardData {
  hosts: ZabbixHost[];
  problems: ZabbixProblem[];
  groups: ZabbixGroup[];
}

export type Severity = '0' | '1' | '2' | '3' | '4' | '5';

export const SEVERITY_MAP: Record<Severity, { label: string; color: string }> = {
  '5': { label: 'DISASTER', color: '#ff2020' },
  '4': { label: 'HIGH',     color: '#ff4b4b' },
  '3': { label: 'AVERAGE',  color: '#ffb800' },
  '2': { label: 'WARNING',  color: '#ff9500' },
  '1': { label: 'INFO',     color: '#0099ff' },
  '0': { label: 'NOT CLASS',color: '#5a6484' },
};
