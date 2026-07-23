# 🚀 دليل نشر الموقع على Cloudflare Workers
# Cloudflare Workers Deployment Guide

---

## المتطلبات الأساسية / Prerequisites

| الأداة | الإصدار | رابط |
|-------|---------|------|
| Node.js | 18+ | https://nodejs.org |
| npm / bun | أي إصدار | مثبّت مسبقاً |
| Wrangler CLI | 4+ | `npm i -g wrangler` |
| حساب Cloudflare | — | https://dash.cloudflare.com |

---

## الخطوة 1: تجهيز قاعدة البيانات (D1)

### 1.1 إنشاء قاعدة بيانات D1

```bash
# تسجيل الدخول إلى Cloudflare (مرة واحدة فقط)
npx wrangler login

# إنشاء قاعدة بيانات D1
npx wrangler d1 create mjh0l-profile-db
```

سيظهر ناتج مثل:

```
✅ Successfully created DB 'mjh0l-profile-db'
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 1.2 تحديث wrangler.toml

انسخ `database_id` وضعه في ملف `wrangler.toml`:

```toml
name = "mjh0l-profile"
compatibility_date = "2025-01-01"

[[d1_databases]]
binding = "DB"
database_name = "mjh0l-profile-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # ← هنا

[vars]
NODE_ENV = "production"
```

### 1.3 رفع الجداول إلى D1

```bash
# رفع الجداول محلياً (للاختبار)
bun run d1:migrate:local

# رفع الجداول على السيرفر (للإنتاج)
bun run d1:migrate
```

---

## الخطوة 2: إعداد متغيرات البيئة

### 2.1 في Cloudflare Dashboard

اذهب إلى:
```
Cloudflare Dashboard → Workers & Pages → mjh0l-profile → Settings → Variables and Secrets
```

أضف المتغيرات التالية:

| المتغير | القيمة | وصف |
|---------|--------|-----|
| `DISCORD_CLIENT_ID` | من Discord Developer Portal | معرف تطبيق ديسكورد |
| `DISCORD_CLIENT_SECRET` | من Discord Developer Portal | سر تطبيق ديسكورد |
| `NEXTAUTH_URL` | `https://your-domain.com` | رابط الموقع |
| `NEXTAUTH_SECRET` | سلسلة عشوائية طويلة | سر الجلسات |
| `IP_SALT` | سلسلة عشوائية | ملح لتشفير الـ IP |

> **ملاحظة**: اذهب إلى https://discord.com/developers/applications وأنشئ تطبيق جديد، ثم اذهب إلى OAuth2 وانسخ Client ID و Client Secret.

### 2.2 أو عبر Wrangler (أسرع)

```bash
npx wrangler secret put DISCORD_CLIENT_ID
npx wrangler secret put DISCORD_CLIENT_SECRET
npx wrangler secret put NEXTAUTH_SECRET
npx wrangler secret put IP_SALT

# متغيرات عادية (غير سرية)
npx wrangler vars set NEXTAUTH_URL="https://your-domain.com"
```

---

## الخطوة 3: بناء ونشر المشروع

### 3.1 البناء

```bash
# بناء المشروع لـ Cloudflare Workers
bun run build:cf
```

هذا الأمر ينفذ:
1. `next build` — بناء تطبيق Next.js
2. `@cloudflare/next-on-pages` — تحويل البناء ليعمل على Workers

### 3.2 نشر على Cloudflare Pages

```bash
# نشر مباشر
bun run deploy:cf
```

أو بشكل مفصّل:

```bash
# بناء
npx @cloudflare/next-on-pages

# نشر
npx wrangler pages deploy .vercel/output/static
```

---

## الخطوة 4: ربط دومين مخصص (اختياري)

### 4.1 في Cloudflare Dashboard

```
Workers & Pages → mjh0l-profile → Custom domains → Add
```

أدخل الدومين الخاص بك (يجب أن يكون على نفس حساب Cloudflare).

### 4.2 أو عبر CLI

```bash
npx wrangler pages deploy .vercel/output/static --project-name=mjh0l-profile
```

---

## الخطوة 5: التحقق من النشر

```bash
# اختبار محلي (قبل النشر)
bun run preview:cf

# التحقق من حالة النشر
npx wrangler pages deployment list --project-name=mjh0l-profile
```

---

## 📂 هيكل الملفات المهمة

```
my-project/
├── wrangler.toml          # إعدادات Cloudflare Workers
├── db/schema.sql          # جداول D1
├── src/
│   ├── app/
│   │   ├── page.tsx       # الصفحة الرئيسية
│   │   ├── layout.tsx      # التخطيط
│   │   └── api/
│   │       ├── visitors/   # عداد الزوار (محمي)
│   │       ├── ideas/      # الأفكار (6 ساعات حماية)
│   │       ├── comments/   # التعليقات
│   │       ├── github/     # بيانات GitHub
│   │       ├── servers/    # سيرفرات ديسكورد
│   │       ├── admin/      # لوحة الإدارة
│   │       ├── services/   # حالة الخدمات
│   │       └── skills/     # المهارات
│   └── lib/
│       ├── db.ts           # قاعدة البيانات (D1 + SQLite محلي)
│       ├── auth.ts         # مصادقة Discord
│       └── security.ts    # حماية وتشفير
└── prisma/
    └── schema.prisma       # مخطط قاعدة البيانات
```

---

## 🔒 أنظمة الحماية المُفعّلة

### 1. حماية الزوار
- كل متصفح يُرسل **fingerprint** فريد (SHA-256)
- الزائر يُسجّل **مرة واحدة فقط** في قاعدة البيانات
- العداد لا يزيد إلا للزوار الجدد
- تعتمد على: `navigator.userAgent + screen + language + timezone + hardwareConcurrency`

### 2. حماية الأفكار
- كل شخص يمكنه إرسال **فكرة واحدة فقط كل 6 ساعات**
- التتبع عبر الـ fingerprint + الـ IP
- رسالة خطأ عربية توضح الوقت المتبقي

### 3. حماية عامة
- **Rate Limiting**: 20 طلب/دقيقة لكل API
- **XSS Protection**: تعقيم كل المدخلات
- **CSRF Protection**: رموز CSRF لكل طلب
- **IP Hashing**: تشفير الـ IP بـ SHA-256 + ملح
- **Security Headers**: حماية كاملة للردود
- **Input Validation**: تحقق من طول ونوع كل المدخل

---

## ❓ حل المشاكل الشائعة

### خطأ: `database_id = "PLACEHOLDER_CHANGE_ME"`
**الحل**: أنشئ قاعدة D1 وانسخ الـ ID الحقيقي إلى `wrangler.toml`

### خطأ: `DISCORD_CLIENT_ID is not defined`
**الحل**: أضف معرّفات ديسكورد كـ secrets عبر `npx wrangler secret put DISCORD_CLIENT_ID`

### خطأ: `Cannot read properties of undefined (reading 'findUnique')`
**الحل**: أعد تشغيل Prisma generate: `bun run db:generate`

### خطأ: بناء يفشل
**الحل**: تأكد من إزالة `output: "standalone"` من `next.config.ts`

### الدومين لا يعمل
**الحل**: تأكد أن DNS سجلات الدومين تشير إلى Cloudflare

---

## 📋 الأوامر السريعة

```bash
# تطوير محلي
bun run dev

# بناء + نشر
bun run deploy:cf

# إنشاء قاعدة D1
bun run d1:create

# رفع الجداول (محلي)
bun run d1:migrate:local

# رفع الجداول (سيرفر)
bun run d1:migrate

# اختبار النشر محلياً
bun run preview:cf

# فحص الكود
bun run lint
```
