FROM public.ecr.aws/docker/library/node:22-alpine3.21

RUN apk add --no-cache postgresql-client

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm install -g ts-node typescript nodemon tsconfig-paths

EXPOSE 3000

CMD ["/bin/sh", "-c", "npm run migrate && USER_COUNT=$(psql \"$DATABASE_URL\" -t -c 'SELECT COUNT(*) FROM users;' 2>/dev/null | tr -d ' \n' || echo '0') && if [ \"$USER_COUNT\" = '0' ]; then npm run seed; else echo 'Données existantes, seeds ignorés.'; fi && npm run dev"]