sleep 5

POCKETBASE_URL="http://localhost:8090"
ADMIN_EMAIL="${POCKETBASE_ADMIN_EMAIL:-admin@example.com}"
ADMIN_PASSWORD="${POCKETBASE_ADMIN_PASSWORD:-admin123456}"

echo "Initializing PocketBase..."

echo "Creating superuser account..."
echo "Creating superuser account..."
./pocketbase superuser upsert "$ADMIN_EMAIL" "$ADMIN_PASSWORD" || echo "Superuser creation failed (may already exist)"

echo "Authenticating as admin..."
ADMIN_TOKEN=$(curl -s -X POST "$POCKETBASE_URL/api/collections/_superusers/auth-with-password" \
  -H "Content-Type: application/json" \
  -d "{
    \"identity\": \"$ADMIN_EMAIL\",
    \"password\": \"$ADMIN_PASSWORD\"
  }" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ]; then
  echo "Failed to authenticate as admin"
  exit 1
fi

echo "Admin token obtained"

echo "Checking if 'users' collection exists..."
COLLECTION_EXISTS=$(curl -s -X GET "$POCKETBASE_URL/api/collections/users" \
  -H "Authorization: $ADMIN_TOKEN" | grep -c '"id"')

if [ "$COLLECTION_EXISTS" -eq 0 ]; then
  echo "Creating 'users' collection..."
  curl -s -X POST "$POCKETBASE_URL/api/collections" \
    -H "Content-Type: application/json" \
    -H "Authorization: $ADMIN_TOKEN" \
    -d '{
      "name": "users",
      "type": "auth",
      "options": {
        "allowEmailAuth": true,
        "allowOAuth2Auth": false,
        "allowUsernameAuth": true,
        "minPasswordLength": 8,
        "requireEmail": true
      },
      "createRule": "",
      "updateRule": "id = @request.auth.id",
      "deleteRule": "id = @request.auth.id",
      "listRule": "id = @request.auth.id",
      "viewRule": "id = @request.auth.id",
      "schema": [
        {
          "name": "username",
          "type": "text",
          "required": true,
          "options": {
            "min": 3,
            "max": 50,
            "pattern": ""
          }
        },
        {
          "name": "role",
          "type": "select",
          "required": false,
          "options": {
            "maxSelect": 1,
            "values": ["player", "admin", "moderator"]
          }
        },
        {
          "name": "avatar_url",
          "type": "url",
          "required": false
        },
        {
          "name": "region",
          "type": "text",
          "required": false
        },
        {
          "name": "bio",
          "type": "text",
          "required": false
        },
        {
          "name": "language",
          "type": "text",
          "required": false
        },
        {
          "name": "matchmaking_pref",
          "type": "json",
          "required": false
        },
        {
          "name": "status",
          "type": "select",
          "required": false,
          "options": {
            "maxSelect": 1,
            "values": ["online", "offline", "away", "in_game"]
          }
        },
        {
          "name": "is_banned",
          "type": "bool",
          "required": false
        }
      ]
    }' || echo "Failed to create collection"
else
  echo "'users' collection already exists - skipping creation"
fi

echo "PocketBase initialization complete!"
