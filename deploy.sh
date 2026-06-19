#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy.sh — Sobe ZabbixView (backend + frontend) no servidor Ubuntu
# Execute como root: bash deploy.sh
# ─────────────────────────────────────────────────────────────────────────────
set -e

ZABBIXVIEW_DIR="/root/zabbixview"
BACKEND_DIR="$ZABBIXVIEW_DIR/backend"
FRONTEND_DIR="$ZABBIXVIEW_DIR/frontend"

echo ""
echo "▶ Instalando dependências do backend..."
cd "$BACKEND_DIR"
npm install

echo ""
echo "▶ Instalando dependências do frontend..."
cd "$FRONTEND_DIR"
npm install

echo ""
echo "▶ Buildando o frontend..."
npm run build

echo ""
echo "═══════════════════════════════════════════════════"
echo "  Build concluído!"
echo ""
echo "  Para subir os serviços, execute:"
echo ""
echo "  Backend (terminal 1):"
echo "    cd $BACKEND_DIR && npm run dev"
echo ""
echo "  Frontend build estático — sirva com:"
echo "    npx serve $FRONTEND_DIR/dist -p 5173"
echo ""
echo "  Ou use pm2 para rodar em background:"
echo "    npm install -g pm2"
echo "    pm2 start \"npm run dev\" --name zabbixview-backend --cwd $BACKEND_DIR"
echo "    pm2 serve $FRONTEND_DIR/dist 5173 --name zabbixview-frontend --spa"
echo "    pm2 save"
echo "═══════════════════════════════════════════════════"
