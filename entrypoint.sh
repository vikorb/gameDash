#!/bin/sh

echo "Attente de la base de données..."

echo "Exécution des migrations..."
npx knex migrate:latest --knexfile ./src/knexfile.ts

echo "Exécution des seeds..."
npx knex seed:run --knexfile ./src/knexfile.ts

echo "Démarrage de l'application..."
exec npm run dev