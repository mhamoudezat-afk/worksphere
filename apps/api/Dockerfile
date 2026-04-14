FROM node:18-alpine

WORKDIR /app

# نسخ package.json من المسار الصحيح
COPY package*.json ./

# تثبيت الاعتماديات
RUN npm install

# نسخ باقي الملفات
COPY . .

EXPOSE 5000

CMD ["node", "src/server-fixed.js"]