FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 3000

# RUN_MIGRATIONS=true aplica as migrations antes de iniciar (necessario no primeiro deploy
# e sempre que houver migration nova).
CMD ["sh", "-c", "if [ \"$RUN_MIGRATIONS\" = \"true\" ]; then npm run db:migrate; fi && npm start"]
