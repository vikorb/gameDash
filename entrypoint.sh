#!/bin/sh

echo "Attente de la base de données..."

echo "Exécution des migrations..."
npx knex migrate:latest --knexfile ./src/knexfile.ts

echo "Vérification si les seeds sont nécessaires..."
USER_COUNT=$(npx knex --knexfile ./src/knexfile.ts seed:run -- --check 2>/dev/null || echo "0")
DB_EMPTY=$(node -e "
const knex = require('knex')(require('./src/knexfile.ts').default || require('./src/knexfile.ts'));
knex('users').count('id as count').first()
  .then(r => { process.stdout.write(String(r.count)); knex.destroy(); })
  .catch(() => { process.stdout.write('0'); process.exit(0); });
" 2>/dev/null || echo "0")

if [ "$DB_EMPTY" = "0" ]; then
  echo "Base vide, exécution des seeds..."
  npx knex seed:run --knexfile ./src/knexfile.ts
else
  echo "Données déjà présentes, seeds ignorés."
fi

echo "Démarrage de l'application..."
exec npm run dev