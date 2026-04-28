import axios from 'axios';
import { ZabbixResponse } from './types';

let requestId = 1;

export async function zabbixCall<T>(
  zabbixUrl: string,
  method: string,
  params: Record<string, unknown>,
  token: string | null = null
): Promise<T> {
  const url = `${zabbixUrl}/api_jsonrpc.php`;

  const payload = {
    jsonrpc: '2.0',
    method,
    params,
    id: requestId++,
    auth: token,
  };

  const { data } = await axios.post<ZabbixResponse<T>>(url, payload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
  });

  if (data.error) {
    throw new Error(data.error.data || data.error.message || 'Zabbix API error');
  }

  if (data.result === undefined) {
    throw new Error('Empty response from Zabbix API');
  }

  return data.result;
}
