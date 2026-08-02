# دليل البيانات — data/

كل محتوى الموقع يعيش هنا في ملفات JSON. **لا تعدّل HTML أو JS لإضافة محتوى** — فقط هذه الملفات.

## الملفات

| الملف | الغرض |
|---|---|
| `settings.json` | إعدادات الموقع: النطاق، اللغات، التنقل، المفاتيح |
| `i18n.json` | نصوص الواجهة (القوائم، الأزرار، النماذج) — بالعربية والإنجليزية |
| `profile.json` | المعلومات الشخصية: الاسم، الـ Hero، النبذة، المهارات، التواصل |
| `projects.json` | المشاريع + دراسة الحالة الكاملة لكل مشروع |
| `articles.json` | مقالات المدونة |
| `faq.json` | الأسئلة الشائعة |

## قاعدة اللغة

أي نص يظهر للزائر له صورتان: `"ar"` و `"en"`. مثال:

```json
"title": {
  "ar": "الآلة الحاسبة الناطقة",
  "en": "Talking Calculator"
}
```

مفاتيح JSON نفسها (مثل `title` و`summary`) تكتب بالإنجليزية دائماً.

---

## إضافة مشروع جديد

افتح `projects.json`، وانسخ عنصراً موجوداً داخل مصفوفة `projects` وعدّل القيم، أو ألصق هذا النموذج:

```json
{
  "id": "my-project",
  "slug": "my-project",
  "featured": true,
  "order": 2,
  "type": "web",
  "title": { "ar": "عنوان المشروع", "en": "Project title" },
  "summary": { "ar": "وصف مختصر", "en": "Short summary" },
  "year": "2026",
  "status": "live",
  "platform": { "ar": "ويب", "en": "Web" },
  "role": { "ar": "دوري في المشروع", "en": "My role" },
  "tech": ["JavaScript", "CSS3"],
  "links": {
    "live": { "url": "https://...", "label": { "ar": "زيارة المشروع", "en": "Visit project" } },
    "demo": null,
    "source": { "url": "https://github.com/...", "label": { "ar": "الكود المصدري", "en": "Source code" } },
    "video": null
  },
  "caseStudy": [
    {
      "id": "problem",
      "blocks": [
        { "type": "p", "text": { "ar": "فقرة", "en": "Paragraph" } },
        {
          "type": "list",
          "items": [
            { "ar": "نقطة أولى", "en": "First item" },
            { "ar": "نقطة ثانية", "en": "Second item" }
          ]
        },
        {
          "type": "dl",
          "rows": [
            { "term": { "ar": "الطبقة", "en": "Layer" }, "detail": { "ar": "وصفها", "en": "Its description" } }
          ]
        }
      ]
    },
    { "id": "goals", "blocks": [] },
    { "id": "research", "blocks": [] },
    { "id": "architecture", "blocks": [] },
    { "id": "ui-decisions", "blocks": [] },
    { "id": "implementation", "blocks": [] },
    { "id": "performance", "blocks": [] },
    { "id": "accessibility", "blocks": [] },
    { "id": "seo", "blocks": [] },
    { "id": "security", "blocks": [] },
    { "id": "testing", "blocks": [] },
    { "id": "lessons", "blocks": [] },
    { "id": "results", "blocks": [] }
  ],
  "gallery": [
    { "src": "assets/images/projects/my-project/1.webp", "alt": { "ar": "...", "en": "..." } }
  ],
  "meta": {
    "description": { "ar": "...", "en": "..." },
    "keywords": ["..."]
  }
}
```

**النموذج الكتلي (`caseStudy`):** صفيف أقسام مرتبة، كل قسم له `id` (تسمياته من `i18n.json` → `projects.caseStudy.<id>`) وقائمة `blocks`. الأنواع المدعومة:
- `p` — فقرة نصية: `{ "type": "p", "text": {...} }`
- `list` — قائمة نقطية: `{ "type": "list", "items": [...] }`
- `dl` — صفوف تعريف (طبقات، قرارات): `{ "type": "dl", "rows": [ { "term": {...}, "detail": {...} } ] }`

تظهر الأقسام بترقيم تلقائي (01، 02...) مع فهرس محتويات، بترتيب ملف JSON. يمكن إضافة أقسام أو إعادة ترتيبها دون لمس أي كود.

**ملاحظات:**
- `id` و`slug` نفس القيمة غالباً — تُستخدم في الرابط `project.html?id=my-project`.
- `status` من: `live`، `inProgress`، `draft`، `archived`.
- `featured: true` يظهر المشروع في الرئيسية.
- `links`: استخدم `null` للروابط غير المتوفرة — لا تضع `#`.
- `gallery`: ضع ملفات الصور في `assets/images/projects/<slug>/` بصيغة WebP (ينصح: عرض 800px)، ثم أدرجها هنا، ثم تحقق بـ `node tools/check-assets.mjs`. القاعدة: **لا تُذكر صورة إلا إذا وُجد ملفها فعلاً** — لا صور وهمية ولا معرض مكسور.

---

## إضافة مقال

افتح `articles.json` وأضف داخل `articles`:

```json
{
  "id": "my-article",
  "slug": "my-article",
  "title": { "ar": "العنوان", "en": "Title" },
  "summary": { "ar": "ملخص", "en": "Summary" },
  "date": "2026-01-01",
  "readingMinutes": 4,
  "tags": ["engineering"],
  "body": {
    "ar": [ { "type": "p", "text": "فقرة" }, { "type": "h2", "text": "عنوان" } ],
    "en": []
  }
}
```

أنواع `body`: `p` فقرة، `h2`/`h3` عناوين، `ul` قائمة (مع `items`)، `code` كتلة كود (مع `lang` للغة ومحتوى داخل `code`)، `quote` اقتباس (مع `text`).

---

## الأسئلة الشائعة

`faq.json`: كل عنصر `{ id, category, question: {ar,en}, answer: {ar,en} }`.
`category` من: `work`، `tech`، `process`.

---

## تغيير النطاق والروابط

- النطاق: `settings.json` ← حقل `url` (يُستخدم في canonical و Open Graph و sitemap).
- معلومات التواصل: `profile.json` ← `contact` و `social`.
- ترتيب القوائم: `settings.json` ← `nav`.

## تحذير

- لا تعليقات في JSON. لا فاصلة زائدة بعد آخر عنصر.
- بعد التعديل، تحقق بصرياً من الصفحة — أي خطأ JSON يجعل القسم فارغاً مع رسالة واضحة في Console المتصفح.
