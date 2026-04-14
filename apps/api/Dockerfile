FROM node:18-alpine

WORKDIR /app

# نسخ ملفات package الخاصة بالـ API فقط
COPY apps/api/package*.json ./apps/api/

# تثبيت الاعتماديات
RUN cd apps/api && npm install --production

# نسخ كود الـ API
COPY apps/api ./apps/api

# تعيين منفذ التشغيل
EXPOSE 5000

# أمر بدء التشغيل
CMD ["node", "apps/api/src/server-fixed.js"]