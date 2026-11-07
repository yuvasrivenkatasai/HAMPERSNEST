#!/bin/bash
set -e

echo "=========================================================="
echo " Starting Enterprise Safe Deployment: HampersNest Backend"
echo "=========================================================="

cd /home/ubuntu/hampersnest-backend

# Step 1: Capture previous working commit
PREV_COMMIT=$(git rev-parse HEAD)
echo "Current working commit: $PREV_COMMIT"

# Step 2: Define rollback function
rollback() {
  echo "::error::DEPLOYMENT FAILED! Rolling back to $PREV_COMMIT..."
  git reset --hard "$PREV_COMMIT"
  npm install --omit=dev
  pm2 reload hampersnest-backend --update-env || pm2 restart hampersnest-backend --update-env
  pm2 save
  echo "Rolled back successfully to previous healthy state."
  exit 1
}

# Step 3: Fetch and update code
echo "[1/4] Pulling latest code from main branch..."
git fetch origin main
git reset --hard origin/main
NEW_COMMIT=$(git rev-parse HEAD)
echo "Updated to commit: $NEW_COMMIT"

# Step 4: Install production dependencies
echo "[2/4] Installing production dependencies..."
npm install --omit=dev

# Step 5: Reload PM2
echo "[3/4] Gracefully reloading PM2 application..."
pm2 reload hampersnest-backend --update-env || pm2 restart hampersnest-backend --update-env
pm2 save

# Step 6: Multi-attempt health check
echo "[4/4] Verifying health check on http://127.0.0.1:5000/..."
HEALTH_OK=0
for i in 1 2 3 4 5 6 7 8 9 10; do
  sleep 2
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5000/ 2>/dev/null || echo "000")
  if [ "$HTTP_CODE" = "200" ]; then
    echo "Health check attempt $i: PASSED (HTTP 200 OK)"
    HEALTH_OK=1
    break
  else
    echo "Health check attempt $i: Status $HTTP_CODE (waiting for PM2 reload...)"
  fi
done

if [ "$HEALTH_OK" -ne 1 ]; then
  echo "Health check failed after 10 attempts! Triggering rollback..."
  rollback
fi

echo "=========================================================="
echo " SUCCESS: HampersNest Backend is live and healthy! "
echo "=========================================================="
