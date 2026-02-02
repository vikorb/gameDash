FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# Vite a besoin du flag --host pour répondre depuis l'intérieur d'un container
CMD ["npm", "run", "dev", "--", "--host"]