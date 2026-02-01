#!/bin/bash

# Quick status check script for backend

echo "🔍 Checking backend status..."
echo ""

# Check PM2 status
echo "📊 PM2 Status:"
pm2 status medium-backend
echo ""

# Check if port is listening
echo "🌐 Port 5000 Status:"
if netstat -tuln | grep -q ":5000 "; then
    echo "✅ Port 5000 is listening"
    netstat -tuln | grep ":5000 "
else
    echo "❌ Port 5000 is NOT listening"
fi
echo ""

# Test health endpoint
echo "🏥 Testing Health Endpoint:"
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo "✅ Health endpoint responding:"
    curl -s http://localhost:5000/api/health | head -c 200
    echo ""
else
    echo "❌ Health endpoint not responding"
fi
echo ""

# Check recent logs
echo "📝 Recent Logs (last 20 lines):"
pm2 logs medium-backend --lines 20 --nostream
echo ""

# Check database connection (if .env exists)
if [ -f .env ]; then
    echo "💾 Database Configuration:"
    grep -E "^DB_" .env | sed 's/PASSWORD=.*/PASSWORD=***/' || echo "No DB config found"
    echo ""
fi

echo "✅ Status check complete!"

