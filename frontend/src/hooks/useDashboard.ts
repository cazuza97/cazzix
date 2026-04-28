import { useState, useEffect, useCallback } from 'react';
import { fetchHosts, fetchProblems, fetchGroups, fetchDemoData } from '@/api/zabbix';
import { DashboardData } from '@/types';
import { useAuth } from './useAuth';

export function useDashboard() {
  const { auth } = useAuth();
  const [data, setData]               = useState<DashboardData | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    if (!auth) return;
    setLoading(true);
    setError(null);
    try {
      if (auth.demoMode) {
        // Try backend demo first, fallback to local
        try {
          const demo = await fetchDemoData();
          setData(demo);
        } catch {
          const { getDemoData } = await import('@/api/zabbix');
          setData(getDemoData());
        }
      } else {
        const [hosts, problems, groups] = await Promise.all([
          fetchHosts(auth.zabbixUrl, auth.token),
          fetchProblems(auth.zabbixUrl, auth.token),
          fetchGroups(auth.zabbixUrl, auth.token),
        ]);
        setData({ hosts, problems, groups });
      }
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [auth]);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 60s (real mode only)
  useEffect(() => {
    if (!auth || auth.demoMode) return;
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, [auth, load]);

  return { data, loading, error, refresh: load, lastUpdated };
}
