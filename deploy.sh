#!/bin/bash
# ──────────────────────────────────────────────────
# Deploy Creative Landing to зорка.рф/landing-creative
# Server: 45.132.18.176 (same as Zorka.ru_NEW)
# Target: /var/www/landing-creative/
# ──────────────────────────────────────────────────

set -euo pipefail

SERVER="root@45.132.18.176"
REMOTE_DIR="/var/www/landing-creative"
LOCAL_DIR="$(cd "$(dirname "$0")" && pwd)/dist"

echo "═══════════════════════════════════════"
echo "  Deploy: зорка.рф/landing-creative"
echo "═══════════════════════════════════════"
echo ""

# Check dist exists
if [ ! -d "$LOCAL_DIR" ]; then
  echo "ERROR: dist/ directory not found. Run the build first."
  exit 1
fi

# Show what we're deploying
echo "Local:  $LOCAL_DIR"
echo "Remote: $SERVER:$REMOTE_DIR"
echo ""

# Get dist size
DIST_SIZE=$(du -sh "$LOCAL_DIR" | cut -f1)
echo "Dist size: $DIST_SIZE"
echo ""

# Create remote dir if needed
echo "→ Ensuring remote directory exists..."
ssh "$SERVER" "mkdir -p $REMOTE_DIR"

# Sync files
echo "→ Syncing files via rsync..."
rsync -avz --delete \
  --exclude='.DS_Store' \
  --exclude='._*' \
  "$LOCAL_DIR/" "$SERVER:$REMOTE_DIR/"

echo ""
echo "→ Setting permissions..."
ssh "$SERVER" "chown -R www-data:www-data $REMOTE_DIR && chmod -R 755 $REMOTE_DIR"

echo ""
echo "═══════════════════════════════════════"
echo "  DONE! Files deployed."
echo ""
echo "  Next steps:"
echo "  1. Add nginx location block from nginx/landing-creative.conf"
echo "     to the server's zorka.conf"
echo "  2. Test config: ssh $SERVER 'nginx -t'"
echo "  3. Reload nginx: ssh $SERVER 'systemctl reload nginx'"
echo "  4. Visit: https://зорка.рф/landing-creative"
echo "═══════════════════════════════════════"
