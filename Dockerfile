@"
FROM node:18-alpine

WORKDIR /app

# نسخ ملفات package
COPY apps/api/package*.json ./apps/api/

# تثبيت الاعتماديات
WORKDIR /app/apps/api
RUN npm install --production

# نسخ كل ملفات API
COPY apps/api .

# تأكد من وجود الملف
RUN ls -la src/

EXPOSE 5000

CMD ["node", "src/server-final.js"]
"@ | Out-File -FilePath Dockerfile -Encoding UTF8