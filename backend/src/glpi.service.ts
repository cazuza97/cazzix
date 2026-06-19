import axios, { AxiosError } from 'axios';

/**
 * GlpiService
 * Gerencia a sessão com a API REST do GLPI.
 * Configuração via variáveis de ambiente:
 *   GLPI_URL       — ex: http://localhost/glpi
 *   GLPI_APP_TOKEN — App-Token criado em Config > API no GLPI
 *   GLPI_USER_TOKEN — User API Token do usuário técnico (Config > Usuários > token)
 */

let sessionToken: string | null = null;

function getConfig() {
  const url       = process.env.GLPI_URL?.replace(/\/$/, '');
  const appToken  = process.env.GLPI_APP_TOKEN;
  const userToken = process.env.GLPI_USER_TOKEN;

  if (!url || !appToken || !userToken) {
    throw new Error(
      'GLPI não configurado. Defina GLPI_URL, GLPI_APP_TOKEN e GLPI_USER_TOKEN no .env'
    );
  }
  return { url, appToken, userToken };
}

function headers(token?: string) {
  const { appToken } = getConfig();
  return {
    'Content-Type': 'application/json',
    'App-Token': appToken,
    ...(token ? { 'Session-Token': token } : {}),
  };
}

/** Inicia ou renova sessão GLPI */
export async function initSession(): Promise<string> {
  const { url, appToken, userToken } = getConfig();

  const { data } = await axios.get(`${url}/apirest.php/initSession`, {
    headers: {
      'Content-Type': 'application/json',
      'App-Token': appToken,
      'Authorization': `user_token ${userToken}`,
    },
  });

  sessionToken = data.session_token as string;
  console.log('[GLPI] ✓ Sessão iniciada');
  return sessionToken;
}

/** Retorna token ativo, renova se necessário */
async function getToken(): Promise<string> {
  if (sessionToken) return sessionToken;
  return initSession();
}

/** Chamada genérica à API GLPI com re-tentativa em caso de sessão expirada */
export async function glpiGet<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const { url } = getConfig();
  const token = await getToken();

  try {
    const { data } = await axios.get<T>(`${url}/apirest.php${path}`, {
      headers: headers(token),
      params,
    });
    return data;
  } catch (err) {
    const axErr = err as AxiosError;
    if (axErr.response?.status === 401) {
      // Sessão expirada — renova e tenta novamente
      sessionToken = null;
      const newToken = await initSession();
      const { data } = await axios.get<T>(`${url}/apirest.php${path}`, {
        headers: headers(newToken),
        params,
      });
      return data;
    }
    throw err;
  }
}

export async function glpiPost<T>(path: string, body: unknown): Promise<T> {
  const { url } = getConfig();
  const token = await getToken();

  try {
    const { data } = await axios.post<T>(`${url}/apirest.php${path}`, body, {
      headers: headers(token),
    });
    return data;
  } catch (err) {
    const axErr = err as AxiosError;
    if (axErr.response?.status === 401) {
      sessionToken = null;
      const newToken = await initSession();
      const { data } = await axios.post<T>(`${url}/apirest.php${path}`, body, {
        headers: headers(newToken),
      });
      return data;
    }
    throw err;
  }
}

export async function glpiPatch<T>(path: string, body: unknown): Promise<T> {
  const { url } = getConfig();
  const token = await getToken();

  try {
    const { data } = await axios.patch<T>(`${url}/apirest.php${path}`, body, {
      headers: headers(token),
    });
    return data;
  } catch (err) {
    const axErr = err as AxiosError;
    if (axErr.response?.status === 401) {
      sessionToken = null;
      const newToken = await initSession();
      const { data } = await axios.patch<T>(`${url}/apirest.php${path}`, body, {
        headers: headers(newToken),
      });
      return data;
    }
    throw err;
  }
}
