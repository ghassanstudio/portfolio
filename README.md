# Portfolio — غسان عبدالخالق

موقع شخصي مبني من الصفر بـ **HTML5 + CSS3 + JavaScript (ES2024)** فقط.
بدون أطر عمل، بدون مكتبات، بدون Backend. يعمل بالكامل على GitHub Pages.

**الفلسفة:** لا نُبهر بالحركة، بل بالهندسة. لا ادعاءات — أدلة.
كل قسم له غرض، وكل بكسل له مبرر، والأداء جزء من التصميم.

---

## العمارة

```
portfolio-v/
├── index.html            الصفحة الرئيسية
├── projects.html         قائمة المشاريع
├── project.html          دراسة الحالة (project.html?id=calc-voice)
├── about.html            نبذة عني
├── blog.html             المدونة
├── blog-post.html        قراءة مقال (blog-post.html?id=...)
├── contact.html          التواصل
├── faq.html              الأسئلة الشائعة
├── privacy.html          سياسة الخصوصية
├── terms.html            شروط الاستخدام
├── 404.html              صفحة غير موجودة
├── offline.html          صفحة عدم الاتصال
├── manifest.webmanifest  بيان PWA
├── sw.js                 Service Worker (الكاش + العمل دون اتصال)
├── robots.txt
├── sitemap.xml
├── css/
│   ├── tokens.css        نظام التصميم — المصدر الوحيد للألوان والخطوط والمسافات
│   ├── base.css          الأساسيات والوصولية
│   ├── layout.css        الهيكل: header, footer, containers
│   ├── components.css    المكونات: أزرار، بطاقات، نماذج، شارات
│   └── pages.css         أنماط الصفحات: hero, دراسة الحالة
├── js/
│   ├── utils.js          دوال عامة نقية
│   ├── data.js           طبقة البيانات: تحميل وتخزين JSON في الذاكرة
│   ├── i18n.js           اللغة (عربي RTL / إنجليزي LTR) والترجمة
│   ├── theme.js          المظهر الفاتح/الداكن
│   ├── components.js     header/footer/التنقل/قائمة الجوال
│   ├── home.js           منطق الصفحة الرئيسية
│   ├── projects.js       فهرس المشاريع (المرحلة 3)
│   ├── project.js        وثيقة دراسة الحالة (المرحلة 3)
│   ├── seo.js            meta ديناميكي و JSON-LD (مرحلة 5)
│   └── *.js              وحدة لكل صفحة حسب مرحلتها
├── tools/
│   ├── check-assets.mjs  فحص سلامة الأصول قبل النشر (Node فقط، خارج المتصفح)
│   └── generate-og.mjs   توليد بطاقة Open Graph (1200×630) عبر Playwright
├── data/                 كل المحتوى — JSON فقط (راجع data/README.md)
│   ├── settings.json
│   ├── i18n.json
│   ├── profile.json
│   ├── projects.json
│   ├── articles.json
│   └── faq.json
└── assets/
    ├── icons/            أيقونات PWA
    └── images/           صور المشاريع (WebP) + og/ بطاقات المشاركة
```

## مبادئ معمارية

1. **البيانات منفصلة عن العرض** — المحتوى في `data/`، والعرض في `js/pages/`.
2. **لا تكرار** — header/footer مكوّن واحد يحقن نفسه في كل صفحة.
3. **اللغة نظام، لا صفحة مكررة** — كل صفحة واحدة تدعم AR/EN من نفس الـ JSON.
4. **الوصولية إلزامية** — WCAG 2.2 AA، تنقل بلوحة المفاتيح، قارئات شاشة، `prefers-reduced-motion`.
5. **الأداء مقاس** — هدف: Lighthouse ≈ 100/100 في الأربعة، بدفعات ألوان وتحميل كسول.

## إضافة محتوى

- **مشروع جديد**: عنصر واحد داخل `data/projects.json` — انظر `data/README.md`. الدراسة كتلية (p/list/dl) وتُعرض تلقائياً بترقيم وفهرس محتويات.
- **صور مشروع**: ضع الملفات ثم أدرجها في `gallery` ثم تحقق بـ `node tools/check-assets.mjs`.
- **مقال جديد**: عنصر واحد داخل `data/articles.json`.
- **سؤال شائع**: عنصر واحد داخل `data/faq.json`.

## النشر على GitHub Pages

1. ارفع المجلد إلى مستودع GitHub Pages (مثلاً `ghassanstudio.github.io/portfolio-v`).
2. Settings → Pages → Source: `Deploy from a branch` → `main` / `root`.
3. عدّل `data/settings.json` ← `url` ليتطابق نطاقك.
4. `404.html` مسموح به كما هو على GitHub Pages، و`sw.js` يحتاج `https` (يوفرها Pages تلقائياً).
5. قبل الرفع: `node tools/check-assets.mjs` — يجب أن يمر بدون مشاكل (يتجاهل صفحات المراحل اللاحقة حتى وجودها).

> ملاحظة: أيقونات PWA وبعض صفحات المراحل اللاحقة لا توجد بعد — ستُضاف في المراحل 4–5. الموقع لا يعرض أقساماً فارغة، والبيانات لا تشير إلى صور غير موجودة.

## مراحل التنفيذ

1. **الأساس والعمارة** — نظام التصميم، ملفات البيانات، نواة JS ✅
2. **القوالب المشتركة + الرئيسية** ✅
3. **المشاريع ودراسات الحالة** — فهرس + وثيقة هندسية لكل مشروع ✅
4. **الصفحات الثانوية** (نبذة، مدونة، تواصل، أسئلة، خصوصية، شروط)
5. **SEO + PWA** (sitemap، manifest، Service Worker، 404/Offline)
6. **المراجعة النهائية** — Lighthouse، الوصولية، تنظيف الملفات القديمة

## الملفات القديمة

`css/style.css` و`js/main.js` و`js/particles.min.js` من الموقع السابق —
ستُحذف في المرحلة النهائية بعد استبدالها بالكامل. (استُبدل `project-details.html` بصفحة `project.html` وحُذف.)
