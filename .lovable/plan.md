# خطة المراجعة الإنتاجية الشاملة

نطاق العمل ضخم ولا يمكن إنجازه في جولة واحدة بجودة عالية. سأنفذها على **4 جولات متتالية**، كل جولة تنتهي بتحقق بصري عبر Playwright وتقرير قصير قبل الانتقال للجولة التالية.

## الجولة 1 — الوظائف وتجربة المستخدم (UX/Bugs) — الأولوية القصوى
1. **فحص شامل لكل الصفحات**: تشغيل Playwright على الصفحات الرئيسية (Home, About, Services, Projects, Architecture, Quote, Contact, Blog, FAQ, Careers, Team, Partners, Admin) والتقاط لقطات + رصد أخطاء console/network.
2. **النماذج (Forms)**: مراجعة Zod validation، رسائل الخطأ بالعربية، حالات التحميل، منع الإرسال المزدوج، تنظيف المدخلات. الصفحات المعنية: Quote, Contact, Careers, MaintenanceTracking, AdminLogin.
3. **الروابط المعطلة**: فحص كل CTA وزر تنقل + 404 handling.
4. **حالات الفراغ والخطأ**: Empty states, Error boundaries, Loading skeletons.
5. **التنقل و الـ Header/Footer**: روابط mobile menu، روابط social، WhatsApp button.
6. **AzaBot**: تجربة text + voice، رفع الملفات، رسائل الخطأ.
7. **Admin Dashboard**: CRUD للمشاريع، الـ webhooks، تسجيل الدخول.

## الجولة 2 — التصميم والاتساق البصري
1. **Design tokens audit**: إيجاد أي `text-white`, `bg-black`, `bg-[#...]` مباشرة واستبدالها بـ semantic tokens.
2. **RTL**: فحص كل صفحة، إصلاح `mr-*/ml-*` التي يجب أن تكون `ms-*/me-*`.
3. **Typography**: تأكيد Tajawal للعناوين، Cairo للنصوص، أحجام متسقة.
4. **Responsive**: فحص mobile/tablet/desktop لكل صفحة رئيسية.
5. **Dark mode**: التأكد من عمله أو إزالته إن لم يكن مطلوبًا.
6. **Spacing/Hierarchy**: توحيد padding/margin بين الأقسام.
7. **Loading screen + Page transitions**: تحسين سلاسة.

## الجولة 3 — الأداء والـ SEO
1. **الصور**: تحويل JPG/PNG كبيرة إلى WebP، إضافة `loading="lazy"` و `alt` text، استخدام `<picture>` للـ LCP image.
2. **Code splitting**: التحقق من `React.lazy` للصفحات الثقيلة.
3. **Bundle analysis**: إزالة dependencies غير المستخدمة.
4. **Meta tags**: عنوان فريد + meta description لكل صفحة عبر `PageMeta`.
5. **Sitemap.xml**: تحديثه ليشمل كل الصفحات الفعلية.
6. **robots.txt**: مراجعة.
7. **JSON-LD**: schema للمنظمة + المشاريع.
8. **Open Graph + Twitter cards**: لكل صفحة.
9. **تشغيل SEO scan** ومعالجة النتائج.

## الجولة 4 — الأمان (Backend/RLS/Edge Functions)
1. **تشغيل security scan الشامل** ومعالجة كل النتائج.
2. **مراجعة RLS policies** لكل جدول (projects, blog_posts, contact_messages, quote_requests, job_applications, webhook_logs, whatsapp_messages, platform_connections).
3. **مراجعة GRANT statements** للجداول العامة.
4. **Edge Functions audit**:
   - input validation بـ Zod
   - CORS صحيح
   - معالجة الأخطاء بدون كشف معلومات حساسة
   - rate limiting حيث يلزم
   - عدم تسريب secrets في الـ logs
5. **Auth hardening**: HIBP password check، إيقاف anonymous signups.
6. **Secrets review**: إزالة أي secret غير مستخدم.
7. **Supabase linter** + معالجة كل التحذيرات.

## التحقق البصري
في نهاية كل جولة: تشغيل Playwright على الصفحات المعدّلة + لقطات desktop (1280×1800) + لقطة mobile (375×800) لتأكيد عدم وجود regression.

## التسليم
بعد كل جولة سأعرض:
- ملخص ما تم إصلاحه
- لقطات قبل/بعد للتغييرات المرئية
- قائمة الملفات المعدلة
- ما تبقى للجولة التالية

---

**ملاحظات تقنية**:
- لن أعدّل ملفات auto-generated (`supabase/client.ts`, `types.ts`, `.env`).
- migrations جديدة تحتاج موافقتك قبل التنفيذ.
- إذا تطلب الأمر secrets جديدة سأطلبها صراحة.
- التزام بـ project-knowledge: strict TS, no `any`, named exports, kebab-case, Tailwind فقط.

هل أبدأ بالجولة 1 (UX/Functions) الآن؟