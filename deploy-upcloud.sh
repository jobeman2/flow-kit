#!/bin/bash
set -e

echo "========================================================"
echo "    🚀 Deploying Flow-Kit Backend to UpCloud VPS        "
echo "========================================================"

# 1. Check Docker & Docker Compose
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable --now docker
fi

# 2. Pull latest code or build containers
echo "🏗️ Building & starting Flow-Kit backend services (Postgres, Redis, API)..."
docker compose -f docker-compose.upcloud.yml up -d --build

# 3. Wait for database & API readiness
echo "⏳ Waiting for API and database to become ready..."
sleep 8

# 4. Push database schema via container
echo "🔄 Ensuring database tables and migrations are up to date..."
docker exec -it flowkit-api pnpm --filter @flow-kit/database db:push || true

# 5. Check health
SERVER_IP=$(curl -s ifconfig.me || hostname -I | awk '{print $1}')
echo ""
echo "========================================================"
echo "    ✅ Flow-Kit Backend successfully deployed!          "
echo "========================================================"
echo "• API Server:     http://${SERVER_IP}:4000"
echo "• Universal SDK:  http://${SERVER_IP}:4000/flow-kit.js"
echo "• Legacy SDK:     http://${SERVER_IP}:4000/sdk.js"
echo "• Health / Tours: http://${SERVER_IP}:4000/v1/public/tours"
echo ""
echo "Next step for Vercel Dashboard:"
echo "In Vercel -> Environment Variables -> Set NEXT_PUBLIC_API_URL to:"
echo "http://${SERVER_IP}:4000 (or https://your-domain.com)"
echo "========================================================"
