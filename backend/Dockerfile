FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm install -g ts-node typescript nodemon tsconfig-paths

EXPOSE 3000

CMD npm run migrate && npm run seed && npm run dev