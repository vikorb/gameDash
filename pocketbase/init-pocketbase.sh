sleep 5

POCKETBASE_URL="http://localhost:8090"
ADMIN_EMAIL="${POCKETBASE_ADMIN_EMAIL:-admin@example.com}"
ADMIN_PASSWORD="${POCKETBASE_ADMIN_PASSWORD:-admin123456}"

echo "Initializing PocketBase..."

echo "Creating superuser account..."
./pocketbase superuser upsert --dir=/pb_data "$ADMIN_EMAIL" "$ADMIN_PASSWORD" 2>/dev/null || echo "Superuser may already exist"

echo "Authenticating as admin..."
ADMIN_AUTH_RESPONSE=$(curl -s -X POST "$POCKETBASE_URL/api/collections/_superusers/auth-with-password" \
  -H "Content-Type: application/json" \
  -d "{
    \"identity\": \"$ADMIN_EMAIL\",
    \"password\": \"$ADMIN_PASSWORD\"
  }")

ADMIN_TOKEN=$(echo "$ADMIN_AUTH_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ]; then
  ADMIN_AUTH_RESPONSE=$(curl -s -X POST "$POCKETBASE_URL/api/admins/auth-with-password" \
    -H "Content-Type: application/json" \
    -d "{
      \"identity\": \"$ADMIN_EMAIL\",
      \"password\": \"$ADMIN_PASSWORD\"
    }")

  ADMIN_TOKEN=$(echo "$ADMIN_AUTH_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
fi

if [ -z "$ADMIN_TOKEN" ]; then
  echo "Failed to authenticate as admin"
  exit 1
fi

echo "Admin token obtained"

echo "Checking if 'users' collection exists..."
COLLECTION_EXISTS=$(curl -s -X GET "$POCKETBASE_URL/api/collections/users" \
  -H "Authorization: $ADMIN_TOKEN" | grep -c '"id"')

USERS_COLLECTION_PAYLOAD='{
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
  "fields": [
    {
      "name": "username",
      "type": "text",
      "required": true,
      "min": 3,
      "max": 50,
      "pattern": ""
    },
    {
      "name": "avatar",
      "type": "file",
      "required": false,
      "maxSelect": 1,
      "maxSize": 0,
      "mimeTypes": ["image/jpeg", "image/png", "image/svg+xml", "image/gif", "image/webp"],
      "thumbs": []
    }
  ]
}'

if [ "$COLLECTION_EXISTS" -eq 0 ]; then
  echo "Creating 'users' collection..."
  curl -s -X POST "$POCKETBASE_URL/api/collections" \
    -H "Content-Type: application/json" \
    -H "Authorization: $ADMIN_TOKEN" \
    -d "$USERS_COLLECTION_PAYLOAD" || echo "Failed to create collection"
else
  echo "'users' collection already exists - applying schema update"
  curl -s -X PATCH "$POCKETBASE_URL/api/collections/users" \
    -H "Content-Type: application/json" \
    -H "Authorization: $ADMIN_TOKEN" \
    -d "$USERS_COLLECTION_PAYLOAD" || echo "Failed to update collection"
fi

echo "PocketBase initialization complete!"
