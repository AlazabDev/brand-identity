#!/bin/bash
# ============================================
# Alazab Universal Deploy Script
# سكريبت نشر شامل لجميع مواقع شركة العزب
# Supports: pnpm (default), npm, yarn
# ============================================

set -e  # Stop on any error

# ─── Configuration ───
DOMAIN="${1:-alazab.com}"  # Accept domain as first argument
SITE_NAME="${DOMAIN%%.*}"   # Extract subdomain or main domain
DEPLOY_BASE="/var/www"
DEPLOY_DIR="${DEPLOY_BASE}/${SITE_NAME}"
BRANCH="${2:-main}"          # Branch as second argument
REPO_URL="${3:-}"            # Repo URL as third argument

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log() { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; exit 1; }
info() { echo -e "${BLUE}ℹ${NC} $1"; }
title() { echo -e "\n${CYAN}═══════════════════════════════════════════════════════════════${NC}"; echo -e "${CYAN}  $1${NC}"; echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}\n"; }

# ─── Help ───
show_help() {
    echo ""
    echo "استخدام السكريبت:"
    echo "  ./deploy.sh [domain] [branch] [repo_url]"
    echo ""
    echo "أمثلة:"
    echo "  ./deploy.sh alazab.com                    # نشر الموقع الرئيسي"
    echo "  ./deploy.sh studio.alazab.com             # نشر Studio"
    echo "  ./deploy.sh api.alazab.com main https://github.com/user/repo.git"
    echo "  ./deploy.sh                               # يستخدم alazab.com افتراضياً"
    echo ""
    echo "المواقع المتوفرة حالياً:"
    ls -1 "$DEPLOY_BASE" 2>/dev/null | grep -v "^$" | sed 's/^/  - /'
    echo ""
    exit 0
}

# ─── Check if help requested ───
if [[ "$1" == "-h" ]] || [[ "$1" == "--help" ]]; then
    show_help
fi

# ─── Welcome ───
echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     شركة العزب للمقاولات العامة - سكريبت النشر الشامل        ║"
echo "║     Alazab Construction - Universal Deploy Script              ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# ─── Step 1: Check prerequisites ───
title "فحص المتطلبات"

# Check package managers
check_package_manager() {
    if command -v pnpm &> /dev/null; then
        PKG_MANAGER="pnpm"
        PKG_VERSION=$(pnpm --version)
    elif command -v npm &> /dev/null; then
        PKG_MANAGER="npm"
        PKG_VERSION=$(npm --version)
    elif command -v yarn &> /dev/null; then
        PKG_MANAGER="yarn"
        PKG_VERSION=$(yarn --version)
    else
        error "لا يوجد مدير حزم (pnpm/npm/yarn)"
    fi
    log "مدير الحزم: $PKG_MANAGER v$PKG_VERSION"
}

# Check Node.js
check_node() {
    command -v node >/dev/null 2>&1 || error "Node.js غير مثبت"
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        error "يتطلب Node.js 18 أو أحدث. الإصدار الحالي: $(node -v)"
    fi
    log "Node.js $(node -v)"
}

# Check tools
check_package_manager
check_node
command -v git >/dev/null 2>&1 || error "git غير مثبت"
command -v nginx >/dev/null 2>&1 && log "Nginx مثبت" || warn "Nginx غير مثبت"
command -v certbot >/dev/null 2>&1 && log "Certbot مثبت" || warn "Certbot غير مثبت"

# ─── Step 2: Prepare workspace ───
title "تجهيز مساحة العمل"

# Create base directory
sudo mkdir -p "$DEPLOY_BASE"

if [ -z "$REPO_URL" ]; then
    # Use existing directory
    if [ -d "$DEPLOY_DIR" ]; then
        info "استخدام المجلد الموجود: $DEPLOY_DIR"
        cd "$DEPLOY_DIR"
        
        # Update if git repo
        if [ -d ".git" ]; then
            info "تحديث الكود من git..."
            git fetch origin
            git reset --hard "origin/${BRANCH}"
            log "تم تحديث الكود"
        fi
    else
        error "المجلد $DEPLOY_DIR غير موجود ولم يتم تحديد REPO_URL"
    fi
else
    # Clone from repository
    PROJECT_DIR="/tmp/${SITE_NAME}-build-$(date +%s)"
    info "استنساخ الكود من $REPO_URL"
    git clone --branch "$BRANCH" --depth 1 "$REPO_URL" "$PROJECT_DIR"
    cd "$PROJECT_DIR"
    log "تم استنساخ الكود"
fi

# ─── Step 3: Install dependencies ───
title "تثبيت الحزم"

if [ -f "pnpm-lock.yaml" ]; then
    info "استخدام pnpm..."
    pnpm install --frozen-lockfile --silent 2>/dev/null || pnpm install --silent
    log "تم تثبيت الحزم باستخدام pnpm"
elif [ -f "package-lock.json" ]; then
    info "استخدام npm..."
    npm ci --production=false --silent 2>/dev/null || npm install --silent
    log "تم تثبيت الحزم باستخدام npm"
elif [ -f "yarn.lock" ]; then
    info "استخدام yarn..."
    yarn install --frozen-lockfile --silent 2>/dev/null || yarn install --silent
    log "تم تثبيت الحزم باستخدام yarn"
else
    warn "لا يوجد lock file، استخدام npm install"
    npm install --silent
fi

# ─── Step 4: Create environment file ───
title "إعداد متغيرات البيئة"

# Try to get Supabase keys from .env or existing deployment
if [ -f ".env.production" ]; then
    cp .env.production .env.production.backup
fi

# Check if we have Supabase variables from environment
if [ -n "$SUPABASE_URL" ] || [ -n "$VITE_SUPABASE_URL" ]; then
    info "استخدام متغيرات البيئة من النظام"
    
    cat > .env << EOF
# Supabase Configuration
VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
VITE_SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
VITE_SUPABASE_PUBLISHABLE_KEY=${SUPABASE_PUBLISHABLE_KEY}
EOF
    log "تم إنشاء ملف .env.production"
else
    warn "لم يتم العثور على متغيرات Supabase، استخدم الملف الموجود أو أضفها"
fi

# ─── Step 5: Build the application ───
title "بناء التطبيق"

BUILD_CMD=""
if [ -f "package.json" ]; then
    if grep -q "\"build\":" package.json; then
        case $PKG_MANAGER in
            pnpm) BUILD_CMD="pnpm build" ;;
            npm)  BUILD_CMD="npm run build" ;;
            yarn) BUILD_CMD="yarn build" ;;
        esac
    fi
fi

if [ -n "$BUILD_CMD" ]; then
    info "تنفيذ: $BUILD_CMD"
    $BUILD_CMD
    log "تم بناء التطبيق بنجاح"
else
    error "لا يوجد أمر build في package.json"
fi

# Determine build output directory
if [ -d "dist" ]; then
    BUILD_DIR="dist"
elif [ -d "build" ]; then
    BUILD_DIR="build"
elif [ -d ".next" ]; then
    BUILD_DIR=".next"
elif [ -d "out" ]; then
    BUILD_DIR="out"
else
    error "لم يتم العثور على مجلد build (dist/build/.next/out)"
fi

log "مجلد البناء: $BUILD_DIR"

# ─── Step 6: Deploy files ───
title "نشر الملفات"

# Create deployment directory
sudo mkdir -p "$DEPLOY_DIR"

# Backup current deployment
if [ -d "$DEPLOY_DIR" ] && [ "$(ls -A $DEPLOY_DIR 2>/dev/null)" ]; then
    BACKUP_DIR="${DEPLOY_DIR}_backup_$(date +%Y%m%d_%H%M%S)"
    sudo cp -r "$DEPLOY_DIR" "$BACKUP_DIR"
    info "تم إنشاء نسخة احتياطية: $BACKUP_DIR"
fi

# Clear and copy new files
sudo rm -rf "${DEPLOY_DIR:?}/"*
sudo cp -r "$BUILD_DIR"/* "$DEPLOY_DIR/" 2>/dev/null || sudo cp -r "$BUILD_DIR"/* "$DEPLOY_DIR/"

# Set permissions
sudo chown -R www-data:www-data "$DEPLOY_DIR"
sudo chmod -R 755 "$DEPLOY_DIR"

log "تم نشر الملفات إلى $DEPLOY_DIR"

# ─── Step 7: Configure Nginx ───
title "إعداد Nginx"

if command -v nginx >/dev/null 2>&1; then
    NGINX_CONF="/etc/nginx/sites-available/${SITE_NAME}"
    
    # Determine if this is a subdomain or main domain
    if [[ "$DOMAIN" == *.*.* ]]; then
        # Has subdomain
        MAIN_DOMAIN="${DOMAIN#*.}"
        SERVER_NAMES="$DOMAIN"
    else
        # Main domain
        MAIN_DOMAIN="$DOMAIN"
        SERVER_NAMES="$DOMAIN www.$DOMAIN"
    fi
    
    info "إنشاء ملف تهيئة Nginx لـ $DOMAIN"
    
    sudo tee "$NGINX_CONF" > /dev/null << NGINX_EOF
# ${SITE_NAME} - Nginx Configuration
# Generated by Alazab Deploy Script on $(date)

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name ${SERVER_NAMES};
    return 301 https://\$host\$request_uri;
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    server_name ${SERVER_NAMES};

    root ${DEPLOY_DIR};
    index index.html;

    # SSL (managed by certbot)
    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|webp|mp4|webm)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri =404;
    }

    # SPA routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Block sensitive files
    location ~ /\. {
        deny all;
    }

    # Error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
NGINX_EOF

    # Enable site
    sudo ln -sf "$NGINX_CONF" "/etc/nginx/sites-enabled/${SITE_NAME}"

    # Test and reload
    if sudo nginx -t 2>/dev/null; then
        sudo systemctl reload nginx
        log "تم إعادة تحميل Nginx"
    else
        warn "خطأ في تكوين Nginx، تحقق من السجلات"
        sudo nginx -t
    fi
else
    warn "Nginx غير مثبت - تخطي إعداد الخادم"
fi

# ─── Step 8: SSL Certificate ───
title "إعداد شهادة SSL"

if command -v certbot >/dev/null 2>&1; then
    if [ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
        info "طلب شهادة SSL جديدة..."
        if [[ "$DOMAIN" == *.*.* ]]; then
            sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "admin@${MAIN_DOMAIN}" 2>/dev/null || {
                warn "فشل الحصول على شهادة SSL، تأكد من DNS وإعدادات النطاق"
            }
        else
            sudo certbot --nginx -d "$DOMAIN" -d "www.${DOMAIN}" --non-interactive --agree-tos --email "admin@${DOMAIN}" 2>/dev/null || {
                warn "فشل الحصول على شهادة SSL، تأكد من DNS وإعدادات النطاق"
            }
        fi
        log "تم إعداد SSL"
    else
        log "شهادة SSL موجودة مسبقاً لـ $DOMAIN"
    fi
else
    warn "Certbot غير مثبت. للتثبيت: sudo apt install certbot python3-certbot-nginx"
fi

# ─── Step 9: Cleanup ───
if [ -n "$PROJECT_DIR" ] && [ "$PROJECT_DIR" != "$DEPLOY_DIR" ] && [ -d "$PROJECT_DIR" ]; then
    rm -rf "$PROJECT_DIR"
    info "تم تنظيف الملفات المؤقتة"
fi

# ─── Step 10: Final Summary ───
title "✅ اكتمل النشر بنجاح!"

echo ""
echo "  ┌─────────────────────────────────────────────────────────────┐"
echo "  │  الموقع: https://${DOMAIN}                                  │"
echo "  │  المسار: ${DEPLOY_DIR}                                      │"
echo "  │  مدير الحزم: ${PKG_MANAGER}                                 │"
echo "  │  التاريخ: $(date '+%Y-%m-%d %H:%M:%S')                      │"
echo "  └─────────────────────────────────────────────────────────────┘"
echo ""

# Show existing sites
echo "  📁 المواقع المنشورة حالياً:"
ls -1 "$DEPLOY_BASE" 2>/dev/null | while read site; do
    if [ -d "$DEPLOY_BASE/$site" ]; then
        if [ -f "/etc/nginx/sites-enabled/$site" ]; then
            echo "     ✓ $site → https://${site}.${DOMAIN:-alazab.com}"
        else
            echo "     ○ $site (غير مفعل)"
        fi
    fi
done

echo ""
echo "  🔧 أوامر مفيدة:"
echo "     نشر موقع آخر: ./deploy.sh [domain] [branch]"
echo "     فحص حالة Nginx: sudo systemctl status nginx"
echo "     عرض السجلات: sudo tail -f /var/log/nginx/${SITE_NAME}.error.log"
echo "     تجديد الشهادات: sudo certbot renew"
echo ""

# Optional: Restart Supabase if needed
if [[ "$DOMAIN" == *"supabase"* ]] || [[ "$DOMAIN" == *"studio"* ]]; then
    echo "  ⚠️  ملاحظة: هذا الموقع يتطلب Supabase يعمل في الخلفية"
    echo "     تأكد من تشغيل Supabase: cd /opt/supabase-project && docker-compose ps"
fi

echo ""
