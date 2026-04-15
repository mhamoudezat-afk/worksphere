FROM node:18-alpine

WORKDIR /app

COPY apps/api/package*.json ./apps/api/

WORKDIR /app/apps/api
RUN npm install --production

COPY apps/api .

EXPOSE 5000

CMD ["node", "src/server-final.js"]
