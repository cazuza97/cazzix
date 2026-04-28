// Arquivo de compatibilidade — a lógica real está em api/zabbix.ts
// Expõe o objeto zabbixApi usado pelo AuthContext original
import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api';

interface ZabbixCallOptions {
  zabbixUrl: string;
  method: string;
  params?: Record<string, unknown>;
  auth?: string | null;
}

export const zabbixApi = {
  async call({ zabbixUrl, method, params = {}, auth = null }: ZabbixCallOptions): Promise<unknown> {
    const { data } = await axios.post(`${BASE_URL}/zabbix/call`, {
      zabbixUrl,
      method,
      params,
      auth,
    });
    if (data.error) throw new Error(data.error);
    return data.result;
  },
};
