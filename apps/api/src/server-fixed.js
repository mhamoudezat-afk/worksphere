// apps/api/src/server-fixed.js
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

// 1. تفعيل trust proxy (أساسي لحل المشكلة)
app.set('trust proxy', 1);

// 2. تكوين rate limiter بشكل صحيح للعمل خلف الـ Proxy
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 دقيقة
	limit: 100, // الحد الأقصى لكل IP
	standardHeaders: true,
	legacyHeaders: false,
	 // IMPORTANT: تحديد مصدر الـ IP من الرأس الصحيح
	keyGenerator: (req) => {
		// استخدام الـ X-Forwarded-For إذا كان موجوداً، وإلا استخدم req.ip
		return req.headers['x-forwarded-for'] || req.ip;
	},
	 // تعطيل التحقق الذي يسبب المشكلة (للتأكد من عدم ظهور الخطأ)
	validate: { xForwardedForHeader: false },
});

// تطبيق الـ rate limiter على جميع الطلبات
app.use(limiter);

// باقي الكود (CORS، Routes، إلخ) يبقى كما هو...