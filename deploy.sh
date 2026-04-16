#!/bin/bash
# ══════════════════════════════════════════════
#  شركة العزب للمقاولات العامة
#  Alazab Construction - Production Deploy Script
#  pnpm + Nginx + SSL (alazab.com)
# ══════════════════════════════════════════════

set -euo pipefail

# ─── Config ───
DOMAIN="brand-identity.alazab.com"
DEPLOY_DIR="/var/www/core/brand-identity"
BUILD_DIR="dist"

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

# ─── 1. Prerequisites ───
info "فحص المتطلبات..."
command -v node  >/dev/null 2>&1 || err "Node.js غير مثبت"
command -v pnpm  >/dev/null 2>&1 || { info "تثبيت pnpm..."; npm i -g pnpm; }
command -v nginx >/dev/null 2>&1 || err "Nginx غير مثبت"

NODE_V=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
[ "$NODE_V" -ge 18 ] || err "يتطلب Node 18+. الحالي: $(node -v)"
ok "المتطلبات جاهزة — Node $(node -v) | pnpm $(pnpm -v)"

# ─── 2. Install ───
info "تثبيت الحزم..."
pnpm install --frozen-lockfile 2>/dev/null || pnpm install
ok "تم تثبيت الحزم"

# ─── 3. Build ───
info "بناء التطبيق للإنتاج..."
pnpm build
[ -d "$BUILD_DIR" ] || err "فشل البناء — مجلد dist غير موجود"
ok "تم البناء بنجاح"

# ─── 4. Deploy files ───
info "نشر الملفات إلى ${DEPLOY_DIR}..."
sudo mkdir -p "$DEPLOY_DIR"
sudo rm -rf "${DEPLOY_DIR:?}/"*
sudo cp -r ${BUILD_DIR}/* "$DEPLOY_DIR/"
sudo chown -R www-data:www-data "$DEPLOY_DIR"
sudo chmod -R 755 "$DEPLOY_DIR"
ok "تم نشر الملفات"

# ─── 5. Nginx config ───
info "إعداد Nginx..."
NGINX_CONF="/etc/nginx/sites-available/${DOMAIN}"

sudo tee "$NGINX_CONF" > /dev/null << 'NGINX_EOF'
# ── HTTP → HTTPS redirect ──
server {
    listen 80;
    listen [::]:80;
    server_name alazab.com www.alazab.com;
    return 301 https://$host$request_uri;
}

# ── Main HTTPS ──
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name b.alazab.com;

    root /var/www/core/brand-identity;
    index index.html;

    # SSL
    ssl_certificate     /etc/letsencrypt/live/brand-identity.alazab.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/brand-identity.alazab.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://connect.facebook.net https://graph.facebook.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://graph.facebook.com https://connect.facebook.net; frame-src https://www.facebook.com https://web.facebook.com;" always;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml application/wasm;

    # Static assets — immutable cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|webp|avif|wasm)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Supabase Edge Functions proxy
    location /functions/v1/ {
        proxy_pass https://drtsurlnlxxhwimbkfse.supabase.co/functions/v1/;
        proxy_set_header Host drtsurlnlxxhwimbkfse.supabase.co;
        proxy_ssl_server_name on;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }

    # Block dotfiles
    location ~ /\. { deny all; }

    error_page 404 /index.html;
}
NGINX_EOF

sudo ln -sf "$NGINX_CONF" "/etc/nginx/sites-enabled/${DOMAIN}"
sudo nginx -t && sudo systemctl reload nginx
ok "تم إعداد Nginx"

# ─── Done ───
echo ""
echo "══════════════════════════════════════"
echo -e "  ${G}✓ تم النشر بنجاح!${N}"
echo "══════════════════════════════════════"
echo ""
echo "  🌐  https://${DOMAIN}"
echo "  📁  ${DEPLOY_DIR}"
echo ""
echo "  للتحديث: git pull && bash deploy.sh"
echo ""
