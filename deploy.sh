#!/bin/bash
# ══════════════════════════════════════════════
#  شركة العزب للمقاولات العامة
#  Alazab Construction - Production Deploy Script
#  pnpm + Nginx + SSL
# ══════════════════════════════════════════════

set -euo pipefail

# ─── Config ───
DOMAIN="brand-identity.alazab.com"
DEPLOY_DIR="/var/www/core/brand-identity"
BUILD_DIR="dist"
WEB_ROOT="${DEPLOY_DIR}/${BUILD_DIR}"
ACME_ROOT="/var/www/letsencrypt"
REQUIRED_NODE_MAJOR="24"

# Colors
G='\033[0;32m' Y='\033[1;33m' R='\033[0;31m' B='\033[0;34m' N='\033[0m'
ok()   { echo -e "${G}[✓]${N} $1"; }
warn() { echo -e "${Y}[!]${N} $1"; }
err()  { echo -e "${R}[✗]${N} $1"; exit 1; }
info() { echo -e "${B}[i]${N} $1"; }

echo ""
echo "══════════════════════════════════════"
echo "  شركة العزب - نشر الإنتاج"
echo "  brand-identity.alazab.com Auto Deploy"
echo "══════════════════════════════════════"
echo ""

# ─── 1. Node.js 24 hard gate ───
info "فحص Node.js 24..."
command -v node >/dev/null 2>&1 || err "Node.js غير مثبت — Node.js 24 إلزامي"
NODE_VERSION="$(node -v)"
NODE_MAJOR="${NODE_VERSION#v}"
NODE_MAJOR="${NODE_MAJOR%%.*}"
[ "$NODE_MAJOR" = "$REQUIRED_NODE_MAJOR" ] || err "Node.js 24 إلزامي. الحالي: ${NODE_VERSION}. تم إيقاف النشر."
ok "Node.js ${NODE_VERSION} مطابق لسياسة الإنتاج"

# ─── 1b. Remaining prerequisites ───
info "فحص بقية المتطلبات..."
command -v pnpm  >/dev/null 2>&1 || { info "تثبيت pnpm..."; npm i -g pnpm; }
command -v nginx >/dev/null 2>&1 || err "Nginx غير مثبت"
ok "المتطلبات جاهزة — Node ${NODE_VERSION} | pnpm $(pnpm -v)"

# ─── 1c. Environment ───
[ -f .env ] || err "ملف .env غير موجود — مطلوب VITE_SUPABASE_URL و VITE_SUPABASE_PUBLISHABLE_KEY"
grep -q "VITE_SUPABASE_URL" .env || err ".env ناقص VITE_SUPABASE_URL"
grep -q "VITE_SUPABASE_PUBLISHABLE_KEY" .env || err ".env ناقص VITE_SUPABASE_PUBLISHABLE_KEY"
ok "متغيرات البيئة جاهزة"

# ─── 2. Install ───
info "تثبيت الحزم..."
pnpm install --frozen-lockfile 2>/dev/null || pnpm install
ok "تم تثبيت الحزم"

# ─── 3. Build ───
info "بناء التطبيق للإنتاج..."
pnpm build
[ -d "$BUILD_DIR" ] || err "فشل البناء — مجلد dist غير موجود"
[ -f "$BUILD_DIR/index.html" ] || err "فشل البناء — dist/index.html غير موجود"
ok "تم البناء بنجاح"

# ─── 4. Prepare static web root ───
info "تجهيز ملفات الإنتاج في ${WEB_ROOT}..."
sudo chown -R www-data:www-data "$WEB_ROOT"
sudo find "$WEB_ROOT" -type d -exec chmod 755 {} \;
sudo find "$WEB_ROOT" -type f -exec chmod 644 {} \;
sudo mkdir -p "${ACME_ROOT}/.well-known/acme-challenge"
ok "ملفات الإنتاج جاهزة بدون حذف ملفات المصدر"

# ─── 5. Nginx config ───
info "إعداد Nginx..."
NGINX_CONF="/etc/nginx/sites-available/${DOMAIN}"
NGINX_ENABLED="/etc/nginx/sites-enabled/${DOMAIN}"
CERT_DIR="/etc/letsencrypt/live/${DOMAIN}"

# First deployment: install a valid HTTP-only ACME bootstrap instead of
# writing an HTTPS server that references certificate files which do not exist yet.
if [ ! -s "${CERT_DIR}/fullchain.pem" ] || [ ! -s "${CERT_DIR}/privkey.pem" ]; then
  warn "شهادة TLS غير موجودة — تفعيل ACME bootstrap على HTTP فقط"
  sudo tee "$NGINX_CONF" > /dev/null << 'NGINX_BOOTSTRAP'
server {
    listen 80;
    listen [::]:80;
    server_name brand-identity.alazab.com;

    location ^~ /.well-known/acme-challenge/ {
        root /var/www/letsencrypt;
        default_type text/plain;
        try_files $uri =404;
    }

    location / {
        return 200 'brand-identity TLS bootstrap\n';
        add_header Content-Type text/plain;
    }
}
NGINX_BOOTSTRAP

  sudo ln -sfn "$NGINX_CONF" "$NGINX_ENABLED"
  sudo nginx -t
  sudo systemctl reload nginx
  err "TLS غير موجود. نفّذ: certbot certonly --webroot -w ${ACME_ROOT} -d ${DOMAIN} ثم أعد bash deploy.sh"
fi

sudo tee "$NGINX_CONF" > /dev/null << 'NGINX_EOF'
server {
    listen 80;
    listen [::]:80;
    server_name brand-identity.alazab.com;

    location ^~ /.well-known/acme-challenge/ {
        root /var/www/letsencrypt;
        default_type text/plain;
        try_files $uri =404;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name brand-identity.alazab.com;

    root /var/www/core/brand-identity/dist;
    index index.html;

    ssl_certificate     /etc/letsencrypt/live/brand-identity.alazab.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/brand-identity.alazab.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(self), geolocation=()" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://connect.facebook.net https://graph.facebook.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; media-src 'self' blob: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://graph.facebook.com https://connect.facebook.net https://api.elevenlabs.io; frame-src 'self' https://www.facebook.com https://web.facebook.com https://3d.magicplan.app https://www.google.com;" always;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml application/wasm;

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|webp|avif|wasm)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
        try_files $uri =404;
    }

    location = /sitemap.xml { add_header Cache-Control "public, max-age=3600"; }
    location = /robots.txt  { add_header Cache-Control "public, max-age=3600"; }

    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, must-revalidate";
    }

    location /functions/v1/ {
        proxy_pass https://tcjbcbmvkajwnsuzhefh.supabase.co/functions/v1/;
        proxy_set_header Host tcjbcbmvkajwnsuzhefh.supabase.co;
        proxy_ssl_server_name on;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }

    location /auth/v1/callback {
        proxy_pass https://tcjbcbmvkajwnsuzhefh.supabase.co/functions/v1/auth-callback;
        proxy_set_header Host tcjbcbmvkajwnsuzhefh.supabase.co;
        proxy_ssl_server_name on;
    }
    location /api/v1/ {
        proxy_pass https://tcjbcbmvkajwnsuzhefh.supabase.co/functions/v1/api-handler/;
        proxy_set_header Host tcjbcbmvkajwnsuzhefh.supabase.co;
        proxy_ssl_server_name on;
    }
    location /api/webhook {
        proxy_pass https://tcjbcbmvkajwnsuzhefh.supabase.co/functions/v1/whatsapp-webhook;
        proxy_set_header Host tcjbcbmvkajwnsuzhefh.supabase.co;
        proxy_ssl_server_name on;
    }

    location ~ /\. { deny all; }
    error_page 404 /index.html;
}
NGINX_EOF

sudo ln -sfn "$NGINX_CONF" "$NGINX_ENABLED"
sudo nginx -t
sudo systemctl reload nginx
ok "تم إعداد Nginx"

# ─── 6. Supabase Keep-Alive ───
info "تثبيت مهمة إبقاء قاعدة Supabase نشطة (كل 24 ساعة)..."
if [ -f scripts/install-keepalive.sh ]; then
  sudo PROJECT_DIR="$(pwd)" bash scripts/install-keepalive.sh || warn "تعذر تثبيت مهمة Keep-Alive"
  ok "مهمة Keep-Alive جاهزة"
else
  warn "scripts/install-keepalive.sh غير موجود — تم التخطي"
fi

# ─── Done ───
echo ""
echo "══════════════════════════════════════"
echo -e "  ${G}✓ تم النشر بنجاح!${N}"
echo "══════════════════════════════════════"
echo ""
echo "  🌐  https://${DOMAIN}"
echo "  📁  ${WEB_ROOT}"
echo "  ⏱   Keep-Alive: systemctl list-timers supabase-keepalive.timer"
echo "  📝  السجل: /var/log/supabase-keepalive.log"
echo ""
echo "  للتحديث: git pull --ff-only origin main && bash deploy.sh"
echo ""