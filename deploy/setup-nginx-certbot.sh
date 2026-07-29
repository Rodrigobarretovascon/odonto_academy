#!/usr/bin/env bash
# Instala Nginx + Certbot e publica gbdental.com.br → http://127.0.0.1:3001
# Rode NA VPS (45.174.64.123), como root ou com sudo:
#
#   cd /caminho/do/repo
#   sudo bash deploy/setup-nginx-certbot.sh seu@email.com
#
set -euo pipefail

EMAIL="${1:-}"
DOMAIN="gbdental.com.br"
WWW="www.gbdental.com.br"
APP_PORT="${APP_PORT:-3001}"
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
NGINX_SRC_HTTP="$REPO_DIR/deploy/nginx/gbdental.com.br.conf"
NGINX_SRC_SSL="$REPO_DIR/deploy/nginx/gbdental.com.br.ssl.conf"
SITE_AVAILABLE="/etc/nginx/sites-available/gbdental.com.br"
SITE_ENABLED="/etc/nginx/sites-enabled/gbdental.com.br"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Execute com sudo/root."
  exit 1
fi

if [[ -z "$EMAIL" ]]; then
  echo "Uso: sudo bash deploy/setup-nginx-certbot.sh seu@email.com"
  exit 1
fi

if ! curl -fsS "http://127.0.0.1:${APP_PORT}/api/health" >/dev/null 2>&1; then
  echo "Aviso: app não respondeu em 127.0.0.1:${APP_PORT}/api/health"
  echo "Suba o GB Dental (NODE_ENV=production PORT=${APP_PORT}) antes ou depois — o Nginx já ficará pronto."
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y nginx certbot python3-certbot-nginx curl

mkdir -p /var/www/certbot
chown -R www-data:www-data /var/www/certbot

# Remove default se estiver no caminho
rm -f /etc/nginx/sites-enabled/default

# Config HTTP inicial (para challenge + proxy)
cp "$NGINX_SRC_HTTP" "$SITE_AVAILABLE"
# Garante porta do app no proxy
sed -i "s|127.0.0.1:3001|127.0.0.1:${APP_PORT}|g" "$SITE_AVAILABLE"
ln -sfn "$SITE_AVAILABLE" "$SITE_ENABLED"

nginx -t
systemctl enable nginx
systemctl restart nginx

echo "→ Emitindo certificado Let's Encrypt para ${DOMAIN} e ${WWW}…"
echo "  Dica Cloudflare: durante a emissão, SSL/TLS pode ficar em Flexible,"
echo "  ou pause o proxy (nuvem cinza) temporariamente se o challenge falhar."

certbot certonly \
  --webroot \
  -w /var/www/certbot \
  -d "$DOMAIN" \
  -d "$WWW" \
  --email "$EMAIL" \
  --agree-tos \
  --non-interactive \
  --keep-until-expiring

# Ativa config SSL
cp "$NGINX_SRC_SSL" "$SITE_AVAILABLE"
sed -i "s|127.0.0.1:3001|127.0.0.1:${APP_PORT}|g" "$SITE_AVAILABLE"

# ssl-dhparams pode não existir em instalações novas — gera se faltar
if [[ ! -f /etc/letsencrypt/ssl-dhparams.pem ]]; then
  if [[ -f /usr/share/doc/certbot-doc/examples/ssl-dhparams.pem ]]; then
    cp /usr/share/doc/certbot-doc/examples/ssl-dhparams.pem /etc/letsencrypt/ssl-dhparams.pem
  else
    openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem 2048
  fi
fi

# options-ssl-nginx.conf
if [[ ! -f /etc/letsencrypt/options-ssl-nginx.conf ]]; then
  curl -fsSL -o /etc/letsencrypt/options-ssl-nginx.conf \
    https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf \
    || cat >/etc/letsencrypt/options-ssl-nginx.conf <<'EOF'
ssl_session_cache shared:le_nginx_SSL:10m;
ssl_session_timeout 1440m;
ssl_session_tickets off;
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers off;
EOF
fi

nginx -t
systemctl reload nginx

# Renovação automática (timer do certbot costuma já existir)
systemctl enable certbot.timer 2>/dev/null || true
systemctl start certbot.timer 2>/dev/null || true

echo
echo "✓ Nginx + Certbot configurados"
echo "  https://${DOMAIN}  →  127.0.0.1:${APP_PORT}"
echo
echo "Na Cloudflare:"
echo "  1) DNS A @ e www → 45.174.64.123 (proxy laranja ok)"
echo "  2) SSL/TLS → Full (agora com certificado no servidor)"
echo "  3) Sempre usar HTTPS → ligado (opcional)"
echo
echo "Teste renovação: certbot renew --dry-run"
