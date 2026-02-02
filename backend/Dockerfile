FROM node:20-alpine

WORKDIR /app

# Installation des dépendances
COPY package*.json ./
RUN npm install

# Copie du code source
COPY . .

# Installation de ts-node globalement pour le dev (plus simple pour débuter)
RUN npm install -g ts-node typescript nodemon tsconfig-paths

EXPOSE 3000

# On lance les migrations PUIS le serveur
CMD npm run migrate && npm run dev