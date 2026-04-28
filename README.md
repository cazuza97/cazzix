# ZabbixView

Dashboard de monitoramento Zabbix com React + TypeScript + Material UI no frontend e Node.js + TypeScript no backend.

---

## Estrutura

```
zabbixview/
├── backend/          Node.js + Express (proxy Zabbix)
└── frontend/         React + TypeScript + MUI
```

---

## Como rodar

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
# Rodando em http://localhost:3001
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# Rodando em http://localhost:5173
```

Abra http://localhost:5173 no browser.

---

## Login

| Campo  | Valor                          |
|--------|--------------------------------|
| Usuário | Admin (ou seu usuário Zabbix) |
| Senha  | sua senha                      |
| URL    | http://localhost:8080          |

Ou clique em **"Usar modo demo"** para testar sem Zabbix.

---

## Como funciona o proxy

```
Browser → http://localhost:5173 (Vite/React)
             ↓ fetch
         http://localhost:3001/api/zabbix/call  (Express)
             ↓ axios
         http://SEU-ZABBIX/api_jsonrpc.php
```

O backend resolve o problema de CORS — o browser nunca fala diretamente com o Zabbix.

---

## Endpoints do backend

| Método | Rota                     | Descrição                        |
|--------|--------------------------|----------------------------------|
| POST   | `/api/zabbix/call`       | Proxy genérico para API Zabbix   |
| GET    | `/api/demo/data`         | Dados mockados para demonstração |
| GET    | `/health`                | Health check                     |

---

## Stack

- **Frontend:** React 18, TypeScript, Vite, Material UI 5, React Router 6, Axios
- **Backend:** Node.js, TypeScript, Express 4, Axios, tsx (hot reload)
