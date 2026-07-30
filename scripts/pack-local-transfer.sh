#!/usr/bin/env bash
# Empacota o que NÃO vai no git para levar a outro Mac.
# Uso: bash scripts/pack-local-transfer.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT_DIR="${ROOT}/tmp/transfer-${STAMP}"
ARCHIVE="${ROOT}/tmp/gbdental-local-${STAMP}.tar.gz"

mkdir -p "$OUT_DIR"

echo "→ Dump Postgres (gabriela_dental)…"
# Ajuste host/porta/user se o seu .env for diferente
if [[ -f "$ROOT/.env" ]]; then
  # shellcheck disable=SC1091
  set -a; source "$ROOT/.env"; set +a
fi
DB_URL="${DATABASE_URL:-postgresql://rbarreto@localhost:5432/gabriela_dental}"
pg_dump "$DB_URL" --no-owner --no-acl --clean --if-exists \
  -f "$OUT_DIR/gabriela_dental.sql"

echo "→ Copiando arquivos locais…"
[[ -f "$ROOT/.env" ]] && cp "$ROOT/.env" "$OUT_DIR/.env"
[[ -d "$ROOT/content/import" ]] && rsync -a "$ROOT/content/import/" "$OUT_DIR/content-import/"
[[ -d "$ROOT/public/uploads" ]] && rsync -a --exclude '.gitkeep' "$ROOT/public/uploads/" "$OUT_DIR/uploads/"

cat > "$OUT_DIR/README-TRANSFER.md" <<'EOF'
# Transferência GB Dental (Mac → Mac)

## 1) Código
No Mac novo:
```bash
git clone git@github.com:Rodrigobarretovascon/odonto_academy.git gabriela
cd gabriela
```

## 2) Extrair este pacote
```bash
tar xzf gbdental-local-*.tar.gz
# copie para a pasta do projeto:
cp gabriela_dental.sql /caminho/do/projeto/tmp/
cp .env /caminho/do/projeto/.env
mkdir -p /caminho/do/projeto/content/import /caminho/do/projeto/public/uploads
rsync -a content-import/ /caminho/do/projeto/content/import/
rsync -a uploads/ /caminho/do/projeto/public/uploads/
```

## 3) Banco
Crie o DB e restaure:
```bash
createdb gabriela_dental   # se ainda não existir
psql "$DATABASE_URL" -f tmp/gabriela_dental.sql
# ou:
# psql -h localhost -p 5432 -d gabriela_dental -f tmp/gabriela_dental.sql
```

Ajuste `DATABASE_URL` no `.env` se o usuário/porta do Postgres for outro neste Mac.

## 4) Dependências
```bash
npm ci
npm ci --prefix server
# opcional (scripts Python): python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
npm run dev:all
```

Não versionar `.env` nem o dump no git.
EOF

echo "→ Compactando…"
tar czf "$ARCHIVE" -C "$OUT_DIR" .
ls -lh "$ARCHIVE"
echo
echo "✓ Pacote pronto: $ARCHIVE"
echo "  Leve por AirDrop, pendrive ou:"
echo "  scp \"$ARCHIVE\" usuario@outro-mac:~/Downloads/"
echo
echo "Conteúdo:"
du -sh "$OUT_DIR"/* | sed 's|^|  |'
