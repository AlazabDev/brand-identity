#!/bin/bash
# ══════════════════════════════════════════════
#  تثبيت مهمة Keep-Alive كل 24 ساعة (systemd timer)
#  الاستخدام: sudo bash scripts/install-keepalive.sh
# ══════════════════════════════════════════════

set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
SCRIPT="$PROJECT_DIR/scripts/keepalive.sh"

[ -f "$SCRIPT" ] || { echo "[✗] السكربت غير موجود: $SCRIPT"; exit 1; }
chmod +x "$SCRIPT"
touch /var/log/supabase-keepalive.log && chmod 644 /var/log/supabase-keepalive.log

if command -v systemctl >/dev/null 2>&1; then
  cat > /etc/systemd/system/supabase-keepalive.service << EOF
[Unit]
Description=Supabase Keep-Alive (brand-identity.alazab.com)
After=network-online.target

[Service]
Type=oneshot
Environment=PROJECT_DIR=$PROJECT_DIR
ExecStart=/bin/bash $SCRIPT
EOF

  cat > /etc/systemd/system/supabase-keepalive.timer << 'EOF'
[Unit]
Description=تشغيل Supabase Keep-Alive كل 24 ساعة

[Timer]
OnBootSec=5min
OnUnitActiveSec=24h
Persistent=true

[Install]
WantedBy=timers.target
EOF

  systemctl daemon-reload
  systemctl enable --now supabase-keepalive.timer
  systemctl start supabase-keepalive.service || true
  echo "[✓] تم التثبيت — للمتابعة: systemctl list-timers supabase-keepalive.timer"
else
  # بديل cron: يومياً الساعة 03:00
  CRON_LINE="0 3 * * * PROJECT_DIR=$PROJECT_DIR /bin/bash $SCRIPT >> /var/log/supabase-keepalive.log 2>&1"
  ( crontab -l 2>/dev/null | grep -v 'keepalive.sh' ; echo "$CRON_LINE" ) | crontab -
  echo "[✓] تم التثبيت عبر cron — للمراجعة: crontab -l"
fi

echo "[i] السجل: /var/log/supabase-keepalive.log"
