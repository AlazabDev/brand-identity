#!/usr/bin/env bash
# =========================================================
# Alazab Universal Deploy Script V2
# Production-ready deploy script for Alazab web properties
# Supports: pnpm / npm / yarn
# Base path: /var/www/core
# =========================================================

set -Eeuo pipefail

# -----------------------------
# Defaults
# -----------------------------
DOMAIN="${1:-alazab.com}"
BRANCH="${2:-main}"
REPO_URL="${3:-}"
BASE_DOMAIN="alazab.com"
DEPLOY_BASE="/var/www/core"
NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"
LOG_DIR="/var/log/alazab-deploy"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
LOG_FILE="${LOG_DIR}/deploy_${TIMESTAMP}.log"

mkdir -p "$LOG_DIR"

# -----------------------------
# Colors
# -----------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log()   { echo -e "${GREEN}✓${NC} $*" | tee -a "$LOG_FILE"; }
warn()  { echo -e "${YELLOW}⚠${NC} $*" | tee -a "$LOG_FILE"; }
info()  { echo -e "${BLUE}ℹ${NC} $*" | tee -a "$LOG_FILE"; }
title() { echo -e "\n${CYAN}═══════════════════════════════════════════════════════════════${NC}\n${CYAN}  $*${NC}\n${CYAN}═══════════════════════════════════════════════════════════════${NC}\n" | tee -a "$LOG_FILE"; }
die()   { echo -e "${RED}✗${NC} $*" | tee -a "$LOG_FILE"; exit 1; }

# -----------------------------
# Help
# -----------------------------
show_help() {
  cat <<'EOF'

الاستخدام:
  /root/deploy-v2.sh [domain] [branch] [repo_url]

أمثلة:
  /root/deploy-v2.sh alazab.com
  /root/deploy-v2.sh uberfix.alazab.com
  /root/deploy-v2.sh brand-identity.alazab.com main https://github.com/org/repo.git

المنطق:
- alazab.com              -> /var/www/core/alazab.com
- any-subdomain.alazab.com -> /var/www/core/<subdomain>

ملاحظات:
- لو REPO_URL فارغ: يستخدم المشروع الموجود محليًا
- لو REPO_URL موجود: يعمل clone مؤقت ثم build ثم deploy
- يعتمد على dist/build/.next/out حسب نوع المشروع

EOF
  exit 0
}

[[ "${1:-}" == "-h" || "${1:-}" == "--help" ]] && show_help

# -----------------------------
# Error / rollback handling
# -----------------------------
BACKUP_DIR=""
DEPLOY_DIR=""
PROJECT_DIR=""
BUILD_DIR=""
PKG_MANAGER=""
ROLLBACK_READY=0

rollback() {
  if [[ "$ROLLBACK_READY" -eq 1 && -n "$BACKUP_DIR" && -n "$DEPLOY_DIR" && -d "$BACKUP_DIR" ]]; then
    warn "فشل أثناء النشر. جاري rollback..."
    sudo mkdir -p "$DEPLOY_DIR"
    sudo rm -rf "${DEPLOY_DIR:?}/"*
    sudo cp -a "$BACKUP_DIR"/. "$DEPLOY_DIR"/
    sudo chown -R www-data:www-data "$DEPLOY_DIR"
    sudo find "$DEPLOY_DIR" -type d -exec chmod 755 {} \;
    sudo find "$DEPLOY_DIR" -type f -exec chmod 644 {} \;
    if command -v nginx >/dev/null 2>&1; then
      sudo nginx -t >/dev/null 2>&1 && sudo systemctl reload nginx || true
    fi
    warn "تم rollback إلى النسخة السابقة"
  fi
}

cleanup() {
  if [[ -n "$PROJECT_DIR" && -d "$PROJECT_DIR" && "$PROJECT_DIR" == /tmp/* ]]; then
    rm -rf "$PROJECT_DIR" || true
  fi
}

on_error() {
  local exit_code=$?
  echo "" | tee -a "$LOG_FILE"
  die "النشر فشل. راجع السجل: $LOG_FILE"
  rollback
  cleanup
  exit "$exit_code"
}

trap 'rollback; cleanup' ERR
trap cleanup EXIT

# -----------------------------
# Domain mapping
# -----------------------------
resolve_site_name() {
  local domain="$1"

  if [[ "$domain" == "$BASE_DOMAIN" ]]; then
    echo "alazab.com"
    return
  fi

  if [[ "$domain" == *".${BASE_DOMAIN}" ]]; then
    echo "${domain%.${BASE_DOMAIN}}"
    return
  fi

  # fallback: replace dots with dashes
  echo "$domain" | sed 's/\./-/g'
}

SITE_NAME="$(resolve_site_name "$DOMAIN")"
DEPLOY_DIR="${DEPLOY_BASE}/${SITE_NAME}"

# server names for nginx
if [[ "$DOMAIN" == "$BASE_DOMAIN" ]]; then
  SERVER_NAMES="${BASE_DOMAIN} www.${BASE_DOMAIN}"
else
  SERVER_NAMES="${DOMAIN}"
fi

# -----------------------------
# Welcome
# -----------------------------
echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                  Alazab Deploy Script V2                     ║"
echo "║                Production-ready deployment                    ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo "" | tee -a "$LOG_FILE"

title "معلومات النشر"
info "DOMAIN      = $DOMAIN"
info "SITE_NAME   = $SITE_NAME"
info "DEPLOY_DIR  = $DEPLOY_DIR"
info "BRANCH      = $BRANCH"
info "REPO_URL    = ${REPO_URL:-<local>}"

# -----------------------------
# Checks
# -----------------------------
title "فحص المتطلبات"

command -v git >/dev/null 2>&1 || die "git غير مثبت"
command -v node >/dev/null 2>&1 || die "Node.js غير مثبت"

NODE_MAJOR="$(node -v | sed 's/^v//' | cut -d. -f1)"
[[ "$NODE_MAJOR" -ge 18 ]] || die "يتطلب Node.js 18 أو أحدث. الحالي: $(node -v)"

if command -v pnpm >/dev/null 2>&1; then
  PKG_MANAGER="pnpm"
elif command -v npm >/dev/null 2>&1; then
  PKG_MANAGER="npm"
elif command -v yarn >/dev/null 2>&1; then
  PKG_MANAGER="yarn"
else
  die "لا يوجد pnpm أو npm أو yarn"
fi

log "Node.js: $(node -v)"
log "Package manager available: $PKG_MANAGER"
command -v nginx >/dev/null 2>&1 && log "Nginx موجود" || warn "Nginx غير موجود"
command -v certbot >/dev/null 2>&1 && log "Certbot موجود" || warn "Certbot غير موجود"

sudo mkdir -p "$DEPLOY_BASE"

# -----------------------------
# Prepare source code
# -----------------------------
title "تجهيز الكود"

if [[ -n "$REPO_URL" ]]; then
  PROJECT_DIR="/tmp/${SITE_NAME}-build-${TIMESTAMP}"
  info "Cloning: $REPO_URL"
  git clone --depth 1 --branch "$BRANCH" "$REPO_URL" "$PROJECT_DIR" | tee -a "$LOG_FILE"
  cd "$PROJECT_DIR"
  log "تم استنساخ الكود إلى $PROJECT_DIR"
else
  [[ -d "$DEPLOY_DIR" ]] || die "المجلد المحلي غير موجود: $DEPLOY_DIR"
  cd "$DEPLOY_DIR"
  PROJECT_DIR="$DEPLOY_DIR"

  if [[ -d ".git" ]]; then
    info "المشروع git repo. جاري التحديث من origin/$BRANCH"
    git fetch origin | tee -a "$LOG_FILE"
    git reset --hard "origin/$BRANCH" | tee -a "$LOG_FILE"
    log "تم تحديث الكود"
  else
    warn "المشروع المحلي ليس git repo. سيتم البناء من الموجود كما هو."
  fi
fi

# -----------------------------
# Dependency installation
# -----------------------------
title "تثبيت الحزم"

if [[ -f "pnpm-lock.yaml" && "$(command -v pnpm || true)" != "" ]]; then
  PKG_MANAGER="pnpm"
  info "Installing with pnpm"
  pnpm install --frozen-lockfile 2>&1 | tee -a "$LOG_FILE" || pnpm install 2>&1 | tee -a "$LOG_FILE"
elif [[ -f "package-lock.json" && "$(command -v npm || true)" != "" ]]; then
  PKG_MANAGER="npm"
  info "Installing with npm"
  npm ci 2>&1 | tee -a "$LOG_FILE" || npm install 2>&1 | tee -a "$LOG_FILE"
elif [[ -f "yarn.lock" && "$(command -v yarn || true)" != "" ]]; then
  PKG_MANAGER="yarn"
  info "Installing with yarn"
  yarn install --frozen-lockfile 2>&1 | tee -a "$LOG_FILE" || yarn install 2>&1 | tee -a "$LOG_FILE"
else
  warn "لا يوجد lockfile مطابق. سيتم استخدام npm install"
  command -v npm >/dev/null 2>&1 || die "npm غير موجود"
  PKG_MANAGER="npm"
  npm install 2>&1 | tee -a "$LOG_FILE"
fi

log "تم تثبيت الحزم"

# -----------------------------
# Environment handling
# -----------------------------
title "متغيرات البيئة"

if [[ -f ".env" ]]; then
  log "يوجد .env داخل المشروع"
else
  warn "لا يوجد .env داخل المشروع"
fi

if [[ -f ".env.production" ]]; then
  log "يوجد .env.production داخل المشروع"
fi

# Optional: write .env only if values are exported in shell
if [[ -n "${VITE_SUPABASE_URL:-}" && -n "${VITE_SUPABASE_ANON_KEY:-}" ]]; then
  info "تم العثور على VITE_SUPABASE_* في البيئة الحالية. سيتم كتابة .env.production"
  cat > .env.production <<EOF
VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
EOF
  log "تم إنشاء .env.production"
else
  warn "لم يتم حقن VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY من shell. سيتم الاعتماد على ملفات المشروع الحالية."
fi

# -----------------------------
# Build
# -----------------------------
title "بناء المشروع"

[[ -f "package.json" ]] || die "package.json غير موجود"

if ! grep -q '"build"' package.json; then
  die "لا يوجد build script داخل package.json"
fi

case "$PKG_MANAGER" in
  pnpm) BUILD_CMD="pnpm build" ;;
  npm)  BUILD_CMD="npm run build" ;;
  yarn) BUILD_CMD="yarn build" ;;
  *) die "Package manager غير مدعوم: $PKG_MANAGER" ;;
esac

info "Executing: $BUILD_CMD"
bash -lc "$BUILD_CMD" 2>&1 | tee -a "$LOG_FILE"
log "تم البناء بنجاح"

# detect build output
if [[ -d "dist" ]]; then
  BUILD_DIR="dist"
elif [[ -d "build" ]]; then
  BUILD_DIR="build"
elif [[ -d "out" ]]; then
  BUILD_DIR="out"
elif [[ -d ".next" ]]; then
  BUILD_DIR=".next"
else
  die "لم يتم العثور على مجلد build صالح: dist / build / out / .next"
fi

log "BUILD_DIR = $BUILD_DIR"

# -----------------------------
# Backup and deploy
# -----------------------------
title "نشر الملفات"

sudo mkdir -p "$DEPLOY_DIR"

if [[ -d "$DEPLOY_DIR" && -n "$(find "$DEPLOY_DIR" -mindepth 1 -maxdepth 1 2>/dev/null)" ]]; then
  BACKUP_DIR="${DEPLOY_DIR}_backup_${TIMESTAMP}"
  sudo mkdir -p "$BACKUP_DIR"
  sudo cp -a "$DEPLOY_DIR"/. "$BACKUP_DIR"/
  ROLLBACK_READY=1
  log "تم إنشاء backup: $BACKUP_DIR"
else
  warn "لا يوجد محتوى قديم لعمل backup"
fi

case "$DEPLOY_DIR" in
  /var/www/core/*) ;;
  *) die "DEPLOY_DIR غير آمن: $DEPLOY_DIR" ;;
esac

sudo rm -rf "${DEPLOY_DIR:?}/"*

if [[ "$BUILD_DIR" == ".next" ]]; then
  # For Next.js standalone not guaranteed here; deploy full folder for now
  sudo cp -a .next "$DEPLOY_DIR"/
  [[ -d "public" ]] && sudo cp -a public "$DEPLOY_DIR"/
  [[ -f "package.json" ]] && sudo cp -a package.json "$DEPLOY_DIR"/
  [[ -f "next.config.js" ]] && sudo cp -a next.config.js "$DEPLOY_DIR"/ || true
  [[ -f "next.config.mjs" ]] && sudo cp -a next.config.mjs "$DEPLOY_DIR"/ || true
else
  sudo cp -a "$BUILD_DIR"/. "$DEPLOY_DIR"/
fi

sudo chown -R www-data:www-data "$DEPLOY_DIR"
sudo find "$DEPLOY_DIR" -type d -exec chmod 755 {} \;
sudo find "$DEPLOY_DIR" -type f -exec chmod 644 {} \;

log "تم نشر الملفات إلى $DEPLOY_DIR"

# -----------------------------
# SSL detection
# -----------------------------
SSL_CERT="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"
SSL_KEY="/etc/letsencrypt/live/${DOMAIN}/privkey.pem"
SSL_SNIPPET=""

if [[ -f "$SSL_CERT" && -f "$SSL_KEY" ]]; then
  SSL_SNIPPET=$(cat <<EOF
    ssl_certificate ${SSL_CERT};
    ssl_certificate_key ${SSL_KEY};
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
EOF
)
  log "تم العثور على شهادة SSL جاهزة"
else
  warn "لا توجد شهادة SSL حاليًا لـ ${DOMAIN}. سيتم إنشاء Nginx HTTP فقط مؤقتًا."
fi

# -----------------------------
# Nginx config
# -----------------------------
title "إعداد Nginx"

if command -v nginx >/dev/null 2>&1; then
  NGINX_CONF="${NGINX_AVAILABLE}/${SITE_NAME}"

  if [[ -n "$SSL_SNIPPET" ]]; then
    sudo tee "$NGINX_CONF" >/dev/null <<EOF
# ${SITE_NAME}
# Generated by Alazab Deploy Script V2 on $(date)

server {
    listen 80;
    listen [::]:80;
    server_name ${SERVER_NAMES};
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${SERVER_NAMES};

${SSL_SNIPPET}

    root ${DEPLOY_DIR};
    index index.html index.htm;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|webp|mp4|webm)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri =404;
        access_log off;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~ /\. {
        deny all;
    }

    error_page 404 /index.html;
}
EOF
  else
    sudo tee "$NGINX_CONF" >/dev/null <<EOF
# ${SITE_NAME}
# Generated by Alazab Deploy Script V2 on $(date)

server {
    listen 80;
    listen [::]:80;
    server_name ${SERVER_NAMES};

    root ${DEPLOY_DIR};
    index index.html index.htm;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|webp|mp4|webm)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri =404;
        access_log off;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~ /\. {
        deny all;
    }

    error_page 404 /index.html;
}
EOF
  fi

  sudo ln -sfn "$NGINX_CONF" "${NGINX_ENABLED}/${SITE_NAME}"

  sudo nginx -t 2>&1 | tee -a "$LOG_FILE"
  sudo systemctl reload nginx
  log "تم تفعيل Nginx بنجاح"
else
  warn "Nginx غير موجود. تم تخطي هذه المرحلة."
fi

# -----------------------------
# SSL issuance if missing
# -----------------------------
title "إعداد SSL"

if command -v certbot >/dev/null 2>&1; then
  if [[ ! -f "$SSL_CERT" || ! -f "$SSL_KEY" ]]; then
    info "لا توجد شهادة. محاولة إصدار شهادة جديدة..."

    if [[ "$DOMAIN" == "$BASE_DOMAIN" ]]; then
      sudo certbot --nginx -d "$BASE_DOMAIN" -d "www.${BASE_DOMAIN}" \
        --non-interactive --agree-tos --email "admin@${BASE_DOMAIN}" 2>&1 | tee -a "$LOG_FILE" || warn "فشل إصدار الشهادة"
    else
      sudo certbot --nginx -d "$DOMAIN" \
        --non-interactive --agree-tos --email "admin@${BASE_DOMAIN}" 2>&1 | tee -a "$LOG_FILE" || warn "فشل إصدار الشهادة"
    fi

    if [[ -f "$SSL_CERT" && -f "$SSL_KEY" ]]; then
      log "تم إصدار شهادة SSL"
      # rewrite nginx to HTTPS version now
      if command -v nginx >/dev/null 2>&1; then
        SSL_SNIPPET=$(cat <<EOF
    ssl_certificate ${SSL_CERT};
    ssl_certificate_key ${SSL_KEY};
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
EOF
)
        sudo tee "$NGINX_CONF" >/dev/null <<EOF
# ${SITE_NAME}
# Generated by Alazab Deploy Script V2 on $(date)

server {
    listen 80;
    listen [::]:80;
    server_name ${SERVER_NAMES};
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${SERVER_NAMES};

${SSL_SNIPPET}

    root ${DEPLOY_DIR};
    index index.html index.htm;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|webp|mp4|webm)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri =404;
        access_log off;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~ /\. {
        deny all;
    }

    error_page 404 /index.html;
}
EOF
        sudo nginx -t 2>&1 | tee -a "$LOG_FILE"
        sudo systemctl reload nginx
        log "تم ترقية الموقع إلى HTTPS"
      fi
    fi
  else
    log "الشهادة موجودة مسبقًا"
  fi
else
  warn "Certbot غير موجود. تم تخطي SSL."
fi

# -----------------------------
# Final summary
# -----------------------------
title "اكتمل النشر"

echo "DOMAIN      : $DOMAIN" | tee -a "$LOG_FILE"
echo "SITE_NAME   : $SITE_NAME" | tee -a "$LOG_FILE"
echo "DEPLOY_DIR  : $DEPLOY_DIR" | tee -a "$LOG_FILE"
echo "BUILD_DIR   : $BUILD_DIR" | tee -a "$LOG_FILE"
echo "PKG_MANAGER : $PKG_MANAGER" | tee -a "$LOG_FILE"
echo "LOG_FILE    : $LOG_FILE" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

log "النشر انتهى بنجاح"
