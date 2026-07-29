#!/usr/bin/env bash
# Publica o GB Dental no servidor Nginx (padrão: 10.100.15.2)
#
# Uso (no Mac, na pasta do projeto):
#   bash deploy/publish.sh
#   bash deploy/publish.sh root@10.100.15.2
#   REMOTE=ubuntu@10.100.15.2 APP_DIR=/var/www/gbdental bash deploy/publish.sh
#
set -euo pipefail

REMOTE="${1:-${REMOTE:-root@10.100.15.2}}"
APP_DIR="${APP_DIR:-/var/www/gbdental}"
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "→ Build local…"
cd "$REPO_DIR"
npm run build

echo "→ Destino: ${REMOTE}:${APP_DIR}"
ssh -o ConnectTimeout=10 "$REMOTE" "mkdir -p '${APP_DIR}'"

echo "→ Enviando arquivos (rsync)…"
rsync -az --delete \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude 'server/node_modules' \
  --exclude '.venv' \
  --exclude 'tmp' \
  --exclude 'content/import' \
  --exclude '.env' \
  --exclude '.DS_Store' \
  --exclude 'agent-transcripts' \
  "$REPO_DIR/" "${REMOTE}:${APP_DIR}/"

echo "→ Instalando dependências e serviço no servidor…"
ssh "$REMOTE" bash -s -- "$APP_DIR" <<'REMOTE'
set -euo pipefail
APP_DIR="$1"
cd "$APP_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "Node não encontrado. Instale Node 20+ neste servidor e rode de novo."
  node -v || true
  exit 1
fi

# Frontend: só precisa do dist (já buildado). Backend: deps de produção.
cd "$APP_DIR/server"
npm ci --omit=dev

cd "$APP_DIR"
if [[ ! -f .env ]]; then
  if [[ -f deploy/env.production.example ]]; then
    cp deploy/env.production.example .env
    echo "⚠ Criado .env a partir de deploy/env.production.example — EDITE DATABASE_URL e JWT_SECRET"
  elif [[ -f .env.example ]]; then
    cp .env.example .env
    echo "⚠ Criado .env a partir de .env.example — EDITE DATABASE_URL e JWT_SECRET"
  else
    echo "⚠ Nenhum .env no servidor. Crie ${APP_DIR}/.env antes de subir o serviço."
  fi
fi

# Ajusta CORS para o domínio se ainda estiver em localhost
if grep -q 'CORS_ORIGIN=http://localhost' .env 2>/dev/null; then
  sed -i 's|CORS_ORIGIN=.*|CORS_ORIGIN=https://gbdental.com.br,http://gbdental.com.br,https://www.gbdental.com.br,http://www.gbdental.com.br|' .env || true
fi
grep -q '^NODE_ENV=production' .env 2>/dev/null || echo 'NODE_ENV=production' >> .env
grep -q '^PORT=' .env 2>/dev/null || echo 'PORT=3001' >> .env

install -m 644 deploy/gbdental.service /etc/systemd/system/gbdental.service
NPM_BIN="$(command -v npm)"
sed -i "s|/usr/bin/npm|${NPM_BIN}|g" /etc/systemd/system/gbdental.service

systemctl daemon-reload
systemctl enable gbdental
systemctl restart gbdental
sleep 2
systemctl --no-pager --full status gbdental | head -25 || true

echo "→ Health check local…"
curl -fsS http://127.0.0.1:3001/api/health || {
  echo "Health falhou. Veja: journalctl -u gbdental -n 80 --no-pager"
  exit 1
}
echo
echo "✓ Publicado em ${APP_DIR}"
REMOTE

echo
echo "Próximos passos no servidor (se ainda não fez):"
echo "  1) Editar ${APP_DIR}/.env (DATABASE_URL, JWT_SECRET)"
echo "  2) Nginx já em /etc/nginx/conf.d/gbdental.conf → nginx -t && systemctl reload nginx"
echo "  3) Quando DNS Active: certbot --nginx -d gbdental.com.br -d www.gbdental.com.br"
echo "  4) Testar: curl -H 'Host: gbdental.com.br' http://10.100.15.2/api/health"
