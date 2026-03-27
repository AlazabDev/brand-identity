#!/usr/bin/env bash
# =========================================================
# Alazab Universal Deploy Script V3 - Final
# Production-ready deploy script for Alazab web properties
# Supports: pnpm / npm / yarn / bun
# Base path: /var/www/core
# =========================================================

set -Eeuo pipefail

# -----------------------------
# Defaults
# -----------------------------
DOMAIN="${1:-}"
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
MAGENTA='\033[0;35m'
NC='\033[0m'

log()   { echo -e "${GREEN}✓${NC} $*" | tee -a "$LOG_FILE"; }
warn()  { echo -e "${YELLOW}⚠${NC} $*" | tee -a "$LOG_FILE"; }
info()  { echo -e "${BLUE}ℹ${NC} $*" | tee -a "$LOG_FILE"; }
title() { echo -e "\n${MAGENTA}═══════════════════════════════════════════════════════════════${NC}\n${CYAN}  $*${NC}\n${MAGENTA}═══════════════════════════════════════════════════════════════${NC}\n" | tee -a "$LOG_FILE"; }
die()   { echo -e "${RED}✗${NC} $*" | tee -a "$LOG_FILE"; exit 1; }

# -----------------------------
# Help
# -----------------------------
show_help() {
  cat <<'EOF'

╔═══════════════════════════════════════════════════════════════╗
║                  Alazab Deploy Script V3                      ║
║                   نظام النشر الآلي                            ║
╚═══════════════════════════════════════════════════════════════╝

الاستخدام:
  deploy.sh [domain] [branch] [repo_url]

أمثلة:
  # نشر الموقع الرئيسي
  deploy.sh alazab.com

  # نشر موقع فرعي
  deploy.sh brand-identity.alazab.com

  # نشر من مستودع معين
  deploy.sh api.alazab.com main https://github.com/org/api.git

  # نشر مع فرع محدد
  deploy.sh alazab.com develop

المواقع المدعومة:
  - alazab.com                → /var/www/core/alazab.com
  - brand-identity.alazab.com → /var/www/core/brand-identity
  - أي نطاق فرعي آخر          → /var/www/core/<subdomain>

المميزات:
  ✓ يدعم pnpm, npm, yarn, bun تلقائياً
  ✓ نسخ احتياطي تلقائي قبل النشر
  ✓ Rollback تلقائي عند الفشل
  ✓ إعداد Nginx تلقائي
  ✓ إدارة شهادات SSL عبر Let's Encrypt
  ✓ دعم Next.js, Vite, React, Vue
  ✓ قراءة متغيرات البيئة من .env أو shell

التقارير:
  السجلات محفوظة في: /var/log/alazab-deploy/

EOF
  exit 0
}

[[ "${1:-}" == "-h" || "${1:-}" == "--help" ]] && show_help

# Check if domain is provided
if [[ -z "$DOMAIN" ]]; then
  echo ""
  echo "⚠️  لم يتم تحديد النطاق"
  echo ""
  echo "المواقع المتوفرة حالياً:"
  if [[ -d "$DEPLOY_BASE" ]]; then
    ls -1 "$DEPLOY_BASE" 2>/dev/null | while read site; do
      if [[ -d "$DEPLOY_BASE/$site" ]]; then
        echo "  - $site.alazab.com"
      fi
    done
  fi
  echo ""
  show_help
fi

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
  
  # Remove protocol if exists
  domain="${domain#https://}"
  domain="${domain#http://}"
  
  # Extract subdomain
  if [[ "$domain" == "$BASE_DOMAIN" ]]; then
    echo "$BASE_DOMAIN"
  elif [[ "$domain" == "www.$BASE_DOMAIN" ]]; then
    echo "$BASE_DOMAIN"
  else
    # Extract subdomain part
    echo "${domain%.$BASE_DOMAIN}"
  fi
}

SITE_NAME="$(resolve_site_name "$DOMAIN")"
DEPLOY_DIR="${DEPLOY_BASE}/${SITE_NAME}"

# Server names for nginx
if [[ "$SITE_NAME" == "$BASE_DOMAIN" ]]; then
  SERVER_NAMES="${BASE_DOMAIN} www.${BASE_DOMAIN}"
else
  SERVER_NAMES="${SITE_NAME}.${BASE_DOMAIN}"
fi

# -----------------------------
# Welcome
# -----------------------------
clear
echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                  Alazab Deploy Script V3                      ║"
echo "║                نظام النشر الآلي - الإصدار النهائي            ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo "" | tee -a "$LOG_FILE"

title "معلومات النشر"
info "النطاق        : $DOMAIN"
info "اسم الموقع    : $SITE_NAME"
info "مسار النشر    : $DEPLOY_DIR"
info "الفرع         : $BRANCH"
[[ -n "$REPO_URL" ]] && info "المستودع      : $REPO_URL" || info "المستودع      : (محلي)"
info "التاريخ       : $(date '+%Y-%m-%d %H:%M:%S')"
info "سجل النشر     : $LOG_FILE"

# -----------------------------
# Checks
# -----------------------------
title "فحص المتطلبات"

# Check git
command -v git >/dev/null 2>&1 || die "git غير مثبت"

# Check Node.js
command -v node >/dev/null 2>&1 || die "Node.js غير مثبت"
NODE_VERSION=$(node -v | sed 's/^v//')
NODE_MAJOR="${NODE_VERSION%%.*}"
[[ "$NODE_MAJOR" -ge 18 ]] || die "يتطلب Node.js 18 أو أحدث. الحالي: $NODE_VERSION"

# Detect package manager
if command -v pnpm >/dev/null 2>&1; then
  PKG_MANAGER="pnpm"
  PKG_VERSION=$(pnpm --version)
elif command -v bun >/dev/null 2>&1; then
  PKG_MANAGER="bun"
  PKG_VERSION=$(bun --version)
elif command -v yarn >/dev/null 2>&1; then
  PKG_MANAGER="yarn"
  PKG_VERSION=$(yarn --version)
elif command -v npm >/dev/null 2>&1; then
  PKG_MANAGER="npm"
  PKG_VERSION=$(npm --version)
else
  die "لا يوجد مدير حزم (pnpm/bun/yarn/npm)"
fi

log "Node.js    : v$NODE_VERSION"
log "مدير الحزم : $PKG_MANAGER v$PKG_VERSION"

# Check optional tools
command -v nginx >/dev/null 2>&1 && log "Nginx موجود" || warn "Nginx غير مثبت (سيتم تخطي إعداد الخادم)"
command -v certbot >/dev/null 2>&1 && log "Certbot موجود" || warn "Certbot غير مثبت (لن يتم إعداد SSL)"

# Create base directory
sudo mkdir -p "$DEPLOY_BASE"
sudo mkdir -p "$(dirname "$DEPLOY_DIR")"

# -----------------------------
# Prepare source code
# -----------------------------
title "تجهيز الكود المصدر"

if [[ -n "$REPO_URL" ]]; then
  PROJECT_DIR="/tmp/${SITE_NAME}-build-${TIMESTAMP}"
  info "استنساخ من المستودع: $REPO_URL (فرع: $BRANCH)"
  git clone --depth 1 --branch "$BRANCH" "$REPO_URL" "$PROJECT_DIR" 2>&1 | tee -a "$LOG_FILE"
  cd "$PROJECT_DIR"
  log "تم استنساخ الكود إلى $PROJECT_DIR"
else
  if [[ -d "$DEPLOY_DIR" ]]; then
    cd "$DEPLOY_DIR"
    PROJECT_DIR="$DEPLOY_DIR"
    info "استخدام المجلد الموجود: $DEPLOY_DIR"
    
    if [[ -d ".git" ]]; then
      info "تحديث الكود من git (فرع: $BRANCH)"
      git fetch origin 2>&1 | tee -a "$LOG_FILE"
      git reset --hard "origin/$BRANCH" 2>&1 | tee -a "$LOG_FILE"
      log "تم تحديث الكود"
    else
      warn "المشروع ليس مستودع git. سيتم استخدام الملفات الموجودة كما هي."
    fi
  else
    die "المجلد $DEPLOY_DIR غير موجود ولم يتم تحديد REPO_URL"
  fi
fi

# Check package.json
if [[ ! -f "package.json" ]]; then
  die "package.json غير موجود في المشروع"
fi

# -----------------------------
# Dependency installation
# -----------------------------
title "تثبيت الحزم"

case "$PKG_MANAGER" in
  pnpm)
    if [[ -f "pnpm-lock.yaml" ]]; then
      info "تثبيت باستخدام pnpm (frozen lockfile)"
      pnpm install --frozen-lockfile 2>&1 | tee -a "$LOG_FILE" || pnpm install 2>&1 | tee -a "$LOG_FILE"
    else
      info "تثبيت باستخدام pnpm"
      pnpm install 2>&1 | tee -a "$LOG_FILE"
    fi
    ;;
  bun)
    info "تثبيت باستخدام bun"
    bun install 2>&1 | tee -a "$LOG_FILE"
    ;;
  yarn)
    if [[ -f "yarn.lock" ]]; then
      info "تثبيت باستخدام yarn (frozen lockfile)"
      yarn install --frozen-lockfile 2>&1 | tee -a "$LOG_FILE" || yarn install 2>&1 | tee -a "$LOG_FILE"
    else
      info "تثبيت باستخدام yarn"
      yarn install 2>&1 | tee -a "$LOG_FILE"
    fi
    ;;
  npm)
    if [[ -f "package-lock.json" ]]; then
      info "تثبيت باستخدام npm ci"
      npm ci 2>&1 | tee -a "$LOG_FILE" || npm install 2>&1 | tee -a "$LOG_FILE"
    else
      info "تثبيت باستخدام npm install"
      npm install 2>&1 | tee -a "$LOG_FILE"
    fi
    ;;
esac

log "تم تثبيت الحزم بنجاح"

# -----------------------------
# Environment handling
# -----------------------------
title "متغيرات البيئة"

# Function to load env file
load_env_file() {
  local env_file="$1"
  if [[ -f "$env_file" ]]; then
    info "قراءة المتغيرات من $env_file"
    set -a
    source "$env_file"
    set +a
    return 0
  fi
  return 1
}

# Try to load from various env files
load_env_file ".env.production" || load_env_file ".env" || true

# Create .env.production if needed
if [[ ! -f ".env.production" ]]; then
  if [[ -f ".env" ]]; then
    info "إنشاء .env.production من .env"
    cp .env .env.production
    log "تم إنشاء .env.production"
  elif [[ -n "${VITE_SUPABASE_URL:-}" || -n "${SUPABASE_URL:-}" ]]; then
    info "إنشاء .env.production من متغيرات shell"
    cat > .env.production <<EOF
# Generated by deploy script on $(date)
VITE_SUPABASE_URL=${VITE_SUPABASE_URL:-${SUPABASE_URL:-}}
VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY:-${SUPABASE_ANON_KEY:-}}
VITE_SUPABASE_PUBLISHABLE_KEY=${VITE_SUPABASE_PUBLISHABLE_KEY:-${SUPABASE_PUBLISHABLE_KEY:-}}
VITE_APP_NAME=${SITE_NAME}
VITE_APP_URL=https://${DOMAIN}
VITE_API_URL=https://api.${BASE_DOMAIN}
EOF
    log "تم إنشاء .env.production"
  else
    warn "لا يوجد ملف .env ولا متغيرات Supabase في shell"
  fi
fi

# Show env variables (masked)
if [[ -f ".env.production" ]]; then
  info "متغيرات البيئة المستخدمة:"
  echo ""
  echo "  ┌─────────────────────────────────────────────────────────────┐"
  while IFS='=' read -r key value; do
    if [[ ! "$key" =~ ^#.* ]] && [ -n "$key" ]; then
      if [[ "$key" =~ KEY$ ]] || [[ "$key" =~ SECRET$ ]] || [[ "$key" =~ PASSWORD$ ]] || [[ "$key" =~ TOKEN$ ]]; then
        value="${value:0:15}..."
      fi
      printf "  │  %-30s = %-40s │\n" "$key" "${value:0:40}"
    fi
  done < .env.production
  echo "  └─────────────────────────────────────────────────────────────┘"
fi

# -----------------------------
# Build
# -----------------------------
title "بناء المشروع"

# Check build script exists
if ! grep -q '"build"' package.json; then
  die "لا يوجد build script في package.json"
fi

# Run build
case "$PKG_MANAGER" in
  pnpm) BUILD_CMD="pnpm build" ;;
  bun)  BUILD_CMD="bun run build" ;;
  yarn) BUILD_CMD="yarn build" ;;
  npm)  BUILD_CMD="npm run build" ;;
esac

info "تنفيذ: $BUILD_CMD"
eval "$BUILD_CMD" 2>&1 | tee -a "$LOG_FILE"
log "تم البناء بنجاح"

# Detect build output directory
if [[ -d "dist" ]]; then
  BUILD_DIR="dist"
elif [[ -d "build" ]]; then
  BUILD_DIR="build"
elif [[ -d "out" ]]; then
  BUILD_DIR="out"
elif [[ -d ".next" ]]; then
  BUILD_DIR=".next"
elif [[ -d "public" ]] && [[ -f "index.html" ]]; then
  BUILD_DIR="."
else
  die "لم يتم العثور على مجلد build (dist/build/out/.next)"
fi

log "مجلد البناء: $BUILD_DIR"

# -----------------------------
# Backup and deploy
# -----------------------------
title "نشر الملفات"

sudo mkdir -p "$DEPLOY_DIR"

# Create backup of current deployment
if [[ -d "$DEPLOY_DIR" ]] && [[ -n "$(ls -A "$DEPLOY_DIR" 2>/dev/null)" ]]; then
  BACKUP_DIR="${DEPLOY_DIR}_backup_${TIMESTAMP}"
  sudo mkdir -p "$BACKUP_DIR"
  sudo cp -a "$DEPLOY_DIR"/. "$BACKUP_DIR"/
  ROLLBACK_READY=1
  log "تم إنشاء نسخة احتياطية: $BACKUP_DIR"
  BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
  info "حجم النسخة: $BACKUP_SIZE"
fi

# Deploy new files
info "نشر الملفات إلى $DEPLOY_DIR"
sudo rm -rf "${DEPLOY_DIR:?}/"*

if [[ "$BUILD_DIR" == ".next" ]]; then
  # Next.js deployment
  sudo cp -a .next "$DEPLOY_DIR"/
  [[ -d "public" ]] && sudo cp -a public "$DEPLOY_DIR"/
  [[ -f "package.json" ]] && sudo cp -a package.json "$DEPLOY_DIR"/
  [[ -f "next.config.js" ]] && sudo cp -a next.config.js "$DEPLOY_DIR"/ 2>/dev/null || true
  [[ -f "next.config.mjs" ]] && sudo cp -a next.config.mjs "$DEPLOY_DIR"/ 2>/dev/null || true
elif [[ "$BUILD_DIR" == "." ]]; then
  # Static site with index.html in root
  sudo cp -a . "$DEPLOY_DIR"/
else
  # Standard build output
  sudo cp -a "$BUILD_DIR"/. "$DEPLOY_DIR"/
fi

# Copy env file to deployment
if [[ -f ".env.production" ]]; then
  sudo cp .env.production "$DEPLOY_DIR/.env"
  log "تم نسخ ملف البيئة"
fi

# Set permissions
sudo chown -R www-data:www-data "$DEPLOY_DIR"
sudo find "$DEPLOY_DIR" -type d -exec chmod 755 {} \;
sudo find "$DEPLOY_DIR" -type f -exec chmod 644 {} \;

DEPLOY_SIZE=$(du -sh "$DEPLOY_DIR" | cut -f1)
log "تم نشر $DEPLOY_SIZE من الملفات"

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
  log "شهادة SSL موجودة: $DOMAIN"
else
  warn "لا توجد شهادة SSL لـ $DOMAIN. سيتم استخدام HTTP فقط مؤقتاً."
fi

# -----------------------------
# Nginx configuration
# -----------------------------
title "إعداد Nginx"

if command -v nginx >/dev/null 2>&1; then
  NGINX_CONF="${NGINX_AVAILABLE}/${SITE_NAME}"
  
  if [[ -n "$SSL_SNIPPET" ]]; then
    sudo tee "$NGINX_CONF" >/dev/null <<EOF
# ${SITE_NAME} - ${DOMAIN}
# Generated by Alazab Deploy Script V3 on $(date)
# Deployment path: ${DEPLOY_DIR}

# HTTP redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name ${SERVER_NAMES};
    return 301 https://\$host\$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${SERVER_NAMES};

${SSL_SNIPPET}

    root ${DEPLOY_DIR};
    index index.html index.htm;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;

    # Static assets with long cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|webp|mp4|webm)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri =404;
        access_log off;
    }

    # SPA routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Health check endpoint (optional)
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Block hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF
  else
    # HTTP only configuration
    sudo tee "$NGINX_CONF" >/dev/null <<EOF
# ${SITE_NAME} - ${DOMAIN}
# Generated by Alazab Deploy Script V3 on $(date)

server {
    listen 80;
    listen [::]:80;
    server_name ${SERVER_NAMES};

    root ${DEPLOY_DIR};
    index index.html index.htm;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
    }

    # Block hidden files
    location ~ /\. {
        deny all;
    }
}
EOF
  fi

  # Enable site
  sudo ln -sfn "$NGINX_CONF" "${NGINX_ENABLED}/${SITE_NAME}"
  
  # Test and reload
  info "اختبار تكوين Nginx..."
  if sudo nginx -t 2>&1 | tee -a "$LOG_FILE"; then
    sudo systemctl reload nginx
    log "تم إعادة تحميل Nginx بنجاح"
  else
    warn "خطأ في تكوين Nginx، يرجى التحقق"
  fi
else
  warn "Nginx غير مثبت. تم تخطي إعداد الخادم"
fi

# -----------------------------
# SSL issuance if missing
# -----------------------------
title "إعداد شهادة SSL"

if command -v certbot >/dev/null 2>&1 && [[ -n "$SSL_SNIPPET" ]]; then
  if [[ ! -f "$SSL_CERT" || ! -f "$SSL_KEY" ]]; then
    info "محاولة إصدار شهادة SSL جديدة..."
    
    if [[ "$SITE_NAME" == "$BASE_DOMAIN" ]]; then
      sudo certbot --nginx -d "$BASE_DOMAIN" -d "www.${BASE_DOMAIN}" \
        --non-interactive --agree-tos --email "admin@${BASE_DOMAIN}" 2>&1 | tee -a "$LOG_FILE" || warn "فشل إصدار الشهادة"
    else
      sudo certbot --nginx -d "${SITE_NAME}.${BASE_DOMAIN}" \
        --non-interactive --agree-tos --email "admin@${BASE_DOMAIN}" 2>&1 | tee -a "$LOG_FILE" || warn "فشل إصدار الشهادة"
    fi
    
    if [[ -f "$SSL_CERT" && -f "$SSL_KEY" ]]; then
      log "تم إصدار شهادة SSL بنجاح"
      sudo systemctl reload nginx
    fi
  fi
else
  warn "Certbot غير مثبت. لتثبيته: sudo apt install certbot python3-certbot-nginx"
fi

# -----------------------------
# Health check
# -----------------------------
title "فحص صحة الموقع"

if command -v curl >/dev/null 2>&1; then
  PROTOCOL="http"
  if [[ -n "$SSL_SNIPPET" ]] || [[ -f "$SSL_CERT" ]]; then
    PROTOCOL="https"
  fi
  
  info "فحص $PROTOCOL://${SERVER_NAMES%% *}"
  sleep 2  # Give nginx time to reload
  
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PROTOCOL://${SERVER_NAMES%% *}" 2>/dev/null || echo "000")
  
  if [[ "$HTTP_CODE" == "200" ]] || [[ "$HTTP_CODE" == "301" ]] || [[ "$HTTP_CODE" == "302" ]]; then
    log "✓ الموقع يعمل (HTTP $HTTP_CODE)"
  else
    warn "⚠ استجابة غير متوقعة: HTTP $HTTP_CODE"
  fi
fi

# -----------------------------
# Final summary
# -----------------------------
title "✅ اكتمل النشر بنجاح!"

echo ""
echo "  ╔═══════════════════════════════════════════════════════════════╗"
echo "  ║  🌐 الموقع: $([[ -n "$SSL_SNIPPET" ]] && echo "https" || echo "http")://${SERVER_NAMES%% *}"
echo "  ║  📁 المسار: $DEPLOY_DIR"
echo "  ║  📦 مدير الحزم: $PKG_MANAGER v$PKG_VERSION"
echo "  ║  🔨 مجلد البناء: $BUILD_DIR"
echo "  ║  📄 حجم النشر: $DEPLOY_SIZE"
echo "  ║  🕐 التاريخ: $(date '+%Y-%m-%d %H:%M:%S')"
echo "  ║  📋 السجل: $LOG_FILE"
echo "  ╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Show backup info if exists
if [[ -n "$BACKUP_DIR" ]]; then
  info "نسخة احتياطية متاحة: $BACKUP_DIR"
  echo "  للاستعادة: sudo cp -a $BACKUP_DIR/* $DEPLOY_DIR/"
fi

echo ""
echo "  🔧 أوامر مفيدة:"
echo "     sudo tail -f $LOG_FILE          # متابعة السجل"
echo "     sudo systemctl status nginx     # حالة Nginx"
echo "     sudo certbot renew --dry-run    # تجديد SSL"
echo "     cd $DEPLOY_DIR && ls -la        # عرض الملفات المنشورة"
echo ""

log "النشر انتهى بنجاح"
