import { Router } from 'express';

export const demoRouter = Router();

// ─── GET /api/demo/data ───────────────────────────
// Retorna dados mockados para demonstração sem Zabbix
demoRouter.get('/data', (_req, res) => {
  const now = Math.floor(Date.now() / 1000);

  const hosts = [
    { hostid: '1', name: 'web-server-01', host: 'web-01', status: '0', available: '1', interfaces: [{ ip: '192.168.1.10' }], groups: [{ name: 'Servidores Web' }] },
    { hostid: '2', name: 'db-server-01',  host: 'db-01',  status: '0', available: '1', interfaces: [{ ip: '192.168.1.11' }], groups: [{ name: 'Banco de Dados' }] },
    { hostid: '3', name: 'app-server-02', host: 'app-02', status: '0', available: '2', interfaces: [{ ip: '192.168.1.12' }], groups: [{ name: 'Aplicação' }] },
    { hostid: '4', name: 'backup-server', host: 'bkp-01', status: '0', available: '1', interfaces: [{ ip: '192.168.1.13' }], groups: [{ name: 'Infraestrutura' }] },
    { hostid: '5', name: 'proxy-nginx',   host: 'prx-01', status: '0', available: '1', interfaces: [{ ip: '192.168.1.14' }], groups: [{ name: 'Servidores Web' }] },
    { hostid: '6', name: 'monitor-zbx',   host: 'zbx-01', status: '0', available: '1', interfaces: [{ ip: '192.168.1.15' }], groups: [{ name: 'Monitoramento' }] },
    { hostid: '7', name: 'redis-cache-01',host: 'rds-01', status: '1', available: '1', interfaces: [{ ip: '192.168.1.16' }], groups: [{ name: 'Cache' }] },
  ];

  const problems = [
    { eventid: '101', name: 'CPU usage is too high on db-server-01', hostid: '2', clock: now - 3600,  severity: '3' },
    { eventid: '102', name: 'Disk space is critically low /var',     hostid: '3', clock: now - 7200,  severity: '4' },
    { eventid: '103', name: 'Interface eth0: High error rate',       hostid: '5', clock: now - 900,   severity: '2' },
  ];

  const groups = [
    { groupid: '1', name: 'Servidores Web' },
    { groupid: '2', name: 'Banco de Dados' },
    { groupid: '3', name: 'Aplicação' },
    { groupid: '4', name: 'Infraestrutura' },
    { groupid: '5', name: 'Monitoramento' },
    { groupid: '6', name: 'Cache' },
  ];

  res.json({ hosts, problems, groups });
});
