# إعداد Supabase لـ Aura Accessories

## 1. إنشاء المشروع في Supabase
- ادخل على [Supabase Dashboard](https://supabase.com/dashboard) وافتح مشروعك.
- Project URL: `https://phwwrcihcerxsllnyzyd.supabase.co`
- Publishable (anon) key: استخدمها في الفرونت إند من ملف `js/supabaseClient.js` (موجود مسبقاً).
- Service (secret) key: تُستخدم من السيرفر فقط (في `server/supabaseService.js`).

## 2. تشغيل الـ Schema في SQL Editor
**مهم:** استخدم ملف **`supabase_schema_express.sql`** (وليس `supabase_schema.sql`) لأن المشروع يعتمد على تسجيل الدخول عبر Express وليس Supabase Auth.

في Supabase: **SQL Editor** → New query → الصق محتوى الملف **`supabase_schema_express.sql`** بالكامل ثم **Run**.

هذا ينشئ الجداول:
- `products` — المنتجات (مع حقل `images` jsonb للصور)
- `blog_posts` — مدونة
- `orders` — الطلبات (`user_id` نصي لمعرف المستخدم من تطبيقك)
- `order_items` — عناصر الطلب
- `ratings` — تقييمات المنتجات

مع سياسات RLS تسمح بـ:
- قراءة المنتجات النشطة والمدونة المنشورة للجميع.
- باقي العمليات تتم عبر السيرفر باستخدام Service key.

## 3. إضافة بيانات أولية (اختياري)
يمكنك إضافة منتجات ومدونة من لوحة الأدمن بعد تشغيل السيرفر.  
أو استيراد من `server/data/db.json` يدوياً إلى جداول Supabase إذا أردت.

## 4. المتغيرات في السيرفر
يمكنك تعيينها في البيئة (أو تبقى القيم الافتراضية داخل الكود):

- `SUPABASE_URL` — عنوان مشروعك
- `SUPABASE_SERVICE_KEY` — المفتاح السري (service role) وليس الـ anon

## 5. التأكد من الاتصال
1. شغّل السيرفر: `npm start`
2. ادخل لوحة الأدمن وأضف منتجاً أو مقال مدونة.
3. تأكد أن المنتجات والمدونة تظهر في الموقع (المتجر والمدونة).

إذا ظهرت بياناتك من الأدمن على الموقع، فالاتصال بـ Supabase يعمل بشكل صحيح.
