import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  fetchItems, fetchHistory,
  ZabbixItem, HistoryPoint,
} from '@/api/zabbix';

// Chaves que vamos buscar no Zabbix (padrões do Zabbix Agent)
const ITEM_KEYS = [
  'system.cpu.util',
  'vm.memory.size',
  'vfs.fs.size',
  'vfs.fs.dependent.size',
  'system.uptime',
  'system.users.num',
  'system.cpu.load',
];

export interface HostMetrics {
  // CPU
  cpuUtil: ZabbixItem | null;
  cpuLoad1: ZabbixItem | null;
  cpuLoad5: ZabbixItem | null;
  cpuLoad15: ZabbixItem | null;
  cpuHistory: HistoryPoint[];

  // Memória
  memTotal: ZabbixItem | null;
  memAvail: ZabbixItem | null;
  memHistory: HistoryPoint[];

  // Disco (pode ser múltiplos)
  diskItems: ZabbixItem[];

  // Sistema
  uptime: ZabbixItem | null;
  users: ZabbixItem | null;

  // Raw
  allItems: ZabbixItem[];
}

export function useHostDetail(hostid: string | undefined) {
  const { auth } = useAuth();
  const [metrics, setMetrics] = useState<HostMetrics | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    if (!auth || !hostid || auth.demoMode) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Busca todos os items relevantes do host
      const items = await fetchItems(auth.zabbixUrl, auth.token, hostid, ITEM_KEYS);

      const find = (keyFragment: string) =>
        items.find((i) => i.key_.includes(keyFragment)) ?? null;

      const findAll = (keyFragment: string) =>
        items.filter((i) => i.key_.includes(keyFragment));

      const cpuUtil  = find('system.cpu.util');
      const cpuLoad1  = items.find((i) => i.key_ === 'system.cpu.load[percpu,avg1]') ?? null;
      const cpuLoad5  = items.find((i) => i.key_ === 'system.cpu.load[percpu,avg5]') ?? null;
      const cpuLoad15 = items.find((i) => i.key_ === 'system.cpu.load[percpu,avg15]') ?? null;
      const memTotal  = items.find((i) => i.key_.includes('vm.memory.size[total]')) ?? null;
      const memAvail  = items.find((i) => i.key_.includes('vm.memory.size[available]') || i.key_.includes('vm.memory.size[free]')) ?? null;
      const uptime    = find('system.uptime');
      const users     = find('system.users.num');
      const diskItems = findAll('vfs.fs');

      // 2. Busca histórico de CPU (últimas 3h)
      const cpuHistoryItems = [cpuUtil, cpuLoad1, cpuLoad5, cpuLoad15].filter(Boolean) as ZabbixItem[];
      const cpuHistory = cpuHistoryItems.length > 0
        ? await fetchHistory(auth.zabbixUrl, auth.token, cpuHistoryItems.map((i) => i.itemid), 0, 3)
        : [];

      // 3. Busca histórico de Memória
      const memHistory = memAvail
        ? await fetchHistory(auth.zabbixUrl, auth.token, [memAvail.itemid], 0, 3)
        : [];

      setMetrics({
        cpuUtil, cpuLoad1, cpuLoad5, cpuLoad15, cpuHistory,
        memTotal, memAvail, memHistory,
        diskItems,
        uptime, users,
        allItems: items,
      });
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar métricas');
    } finally {
      setLoading(false);
    }
  }, [auth, hostid]);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh 60s
  useEffect(() => {
    if (!auth || auth.demoMode) return;
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, [auth, load]);

  return { metrics, loading, error, refresh: load, lastUpdated };
}
