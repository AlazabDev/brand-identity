#!/bin/bash
# ══════════════════════════════════════════════
#  Supabase Keep-Alive — brand-identity.alazab.com
#  يمنع تجميد مشروع Supabase المجاني عبر استعلام دوري
# ══════════════════════════════════════════════

set -uo pipefail

# مسار المشروع (يمكن تجاوزه: PROJECT_DIR=/var/www/... bash keepalive.sh)
PROJECT_DIR="${PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
ENV_FILE="${ENV_FILE:-$PROJECT_DIR/.env}"
LOG_FILE="${LOG_FILE:-/var/log/supabase-keepalive.log}"

log() { echo "[$(date '+%d/%m/%Y %H:%M:%S')] $1" | tee -a "$LOG_FILE" 2>/dev/null || echo "[$(date '+%d/%m/%Y %H:%M:%S')] $1"; }

if [ -f "$ENV_FILE" ]; then
  SUPABASE_URL=$(grep -E '^VITE_SUPABASE_URL' "$ENV_FILE" | cut -d'"' -f2)
  SUPABASE_KEY=$(grep -E '^VITE_SUPABASE_PUBLISHABLE_KEY' "$ENV_FILE" | cut -d'"' -f2)
else
  SUPABASE_URL="${VITE_SUPABASE_URL:-}"
  SUPABASE_KEY="${VITE_SUPABASE_PUBLISHABLE_KEY:-}"
fi

if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SUPABASE_KEY:-}" ]; then
  log "✗ متغيرات Supabase غير متوفرة (تحقق من $ENV_FILE)"
  exit 1
fi

ENDPOINT="${SUPABASE_URL}/rest/v1/supcloud_keepalive?select=id&limit=1"

ATTEMPT=1
MAX_ATTEMPTS=3
while [ "$ATTEMPT" -le "$MAX_ATTEMPTS" ]; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 20 \
    "$ENDPOINT" \
    -H "apikey: ${SUPABASE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_KEY}")

  if [ "$CODE" = "200" ]; then
    log "✓ القاعدة نشطة — HTTP $CODE (محاولة $ATTEMPT)"
    exit 0
  fi

  log "! فشل الاتصال — HTTP $CODE (محاولة $ATTEMPT/$MAX_ATTEMPTS)"
  ATTEMPT=$((ATTEMPT + 1))
  sleep 10
done

log "✗ تعذر الوصول إلى القاعدة بعد $MAX_ATTEMPTS محاولات"
exit 1
