🧠 Job Intel — Smart Job & HR Platform

Job Intel هو تطبيق ويب تفاعلي يربط بين الباحثين عن عمل (Job Seekers / Employees) وبين مسؤولي التوظيف (HR Managers).
يقدّم النظام لوحة تحكم لكل طرف، مع اختبارات تقييم، مقابلة فيديو، نظام إشعارات، وصفحات إعدادات، وتسجيل دخول مخصص حسب الدور.

🚀 المميزات الأساسية

🔒 نظام مصادقة Roles (HR / Job Seeker / Employee)

🧑‍💼 لوحة تحكم HR لإدارة الوظائف والمتقدمين

👷‍♂️ لوحة تحكم موظف لتتبع الاختبارات والتقدّم

🎥 مقابلة فيديو تفاعلية عبر الكاميرا والمايك (مع عدّاد زمني وتخزين محلي)

💾 حفظ تلقائي في LocalStorage

🧩 Protected Routes عبر PrivateRoute و RoleRoute

🧠 Alerts و Toasters باستخدام SweetAlert2

🎨 تصميم حديث بـ TailwindCSS

🧭 تنظيم صفحات احترافي باستخدام React Router v6

🧱 مكونات قابلة لإعادة الاستخدام (Layouts, Hooks, Components)

✨ **تحديثات واجهة المستخدم الأخيرة (UI/UX Updates v2.0):**
- **إعادة تصميم صفحات المصادقة (Auth Pages):** 
  - تم تحسين تصميم `Signup`, `Login`, و `ForgotPassword` لتتطابق تماماً مع تصاميم UI/UX المتقدمة.
  - إضافة ميزة الشريط المضيء المتحرك المخصص (`ElectricBorder`) حول بطاقات إدخال البيانات.
  - دعم التبديل الديناميكي الكامل بين الوضع العادي (Light) والمظلم (Dark) مع تخصيص الألوان (برتقالي وأزرق وبنفسجي) حسب نوع الحساب.
  - دمج الأيقونات والتفاعلات الحركية (Hover effects) مثل الأسهم والظلال المتحركة.
- **تحسينات إضافية:** إصلاح مشاكل الـ Responsive design لشعار الموقع، وضبط حقول كلمة المرور (إظهار/إخفاء).

🛠️ التقنيات المستخدمة
الفئة	التقنية / المكتبة	الإصدار
⚛️ Framework	React	18.2.0
🔄 Routing	react-router-dom	6.23.0
🎨 CSS Framework	Tailwind CSS	3.4.1
🧾 Alerts	SweetAlert2	11.10.0
📦 Build Tool	Vite	5.1.0
🧠 Icons / UI	Lucide React (optional)	latest
🧩 State Mgmt	React Context (AuthProvider)	—
💽 Storage	LocalStorage (client-side)	—
🎥 Video API	MediaRecorder + getUserMedia	Web API
🧰 Development	Node.js	≥ 18.0.0
🧰 Package Manager	npm / yarn / pnpm	latest
🧩 هيكل المشروع
│   App.css
│   App.jsx
│   index.css
│   main.jsx
│   
├───api
│       authService.js
│       axios.js
│
├───auth
│       AuthProvider.jsx
│
├───Components
│   │   ElectricBorder.jsx
│   │   FullScreenLoader.jsx
│   │   LogoIcon.jsx
│   │   Navbar.jsx
│   │   ProfileSetupLayout.jsx
│   │   ProfileSetupNavbar.jsx
│   │   ProfileSidebarStepper.jsx
│   │   Robot404Icon.jsx
│   │   ThemeToggle.jsx
│   │   ThemeToggleDropdown.jsx
│   │   TrendBarChart.jsx
│   │
│   └───ui
│           chart.jsx
│
├───context
│       AuthContext.jsx
│
├───hooks
│       useConfirmLogout.js
│
├───layout
│   │   AuthLayout.jsx
│   │
│   ├───employee
│   │       EmployeeLayout.jsx
│   │       Sidebar.jsx
│   │       Topbar.jsx
│   │
│   └───hr
│           HRLayout.jsx
│           HRSidebar.jsx
│           Topbar.jsx
│
├───lib
│       alerts.js
│       utils.js
│
├───loader
│       LoaderProvider.jsx
│
├───pages
│   │   About.jsx
│   │   ContactUs.jsx
│   │   Faqs.jsx
│   │   HelpCenter.jsx
│   │   Home.jsx
│   │   Login.jsx
│   │   NotFound.jsx
│   │   Privacy.jsx
│   │   Signup.jsx
│   │
│   ├───auth
│   │       ForgotPassword.jsx
│   │       ResetPassword.jsx
│   │       VerifyEmail.jsx
│   │
│   ├───employee
│   │       Dashboard.jsx
│   │       Jobs.jsx
│   │       Notifications.jsx
│   │       Profile.jsx
│   │       Settings.jsx
│   │       Tests.jsx
│   │       VideoInterview.jsx
│   │
│   ├───hr
│   │       HRCandidates.jsx
│   │       HRDashboard.jsx
│   │       HRJobs.jsx
│   │       HRNotifications.jsx
│   │       HRSettings.jsx
│   │
│   └───step-profile
│           Step-1.jsx
│           Step-2.jsx
│           Step-3.jsx
│
├───routes
│       PrivateRoute.jsx
│       RoleRoute.jsx
│
├───styles
│       globals.css
│
├───theme
│       theme.css
│       ThemeProvider.jsx
│
└───utils
        extractError.js
⚙️ الإعداد المحلي (Local Setup)
1️⃣ المتطلبات

Node.js ≥ 18

npm ≥ 9

متصفح يدعم MediaRecorder (Chrome / Edge / Firefox)

2️⃣ تثبيت الحزم
npm install
# أو
yarn install

3️⃣ تشغيل المشروع
npm run dev
# أو
yarn dev


ثم افتح:

http://localhost:5173/

🔐 نظام المصادقة (Authentication System)

المستخدم يحدد الدور (HR أو Job-Seeker) أثناء تسجيل الدخول

يتم حفظ الجلسة في AuthContext

PrivateRoute تمنع الوصول لصفحات محمية بدون تسجيل

RoleRoute تمنع المستخدم من فتح لوحات تخص دور آخر

📸 مقابلة الفيديو (Video Interview)

المسار: /employee/interview

تسجيل إجابة فيديو لكل سؤال باستخدام الكاميرا

حد زمني افتراضي لكل سؤال (120 ثانية)

لا يمكن تسليم المقابلة إلا بعد تسجيل 3 فيديوهات على الأقل

بعد التسليم يتم القفل (localStorage["vi_locked"]=1)

يمكن إعادة التسجيل مرة واحدة لكل سؤال

🧠 التكامل مع الذكاء الاصطناعي (AI Evaluation)

قابل للتفعيل لاحقًا:

رفع الفيديو إلى الخادم

تحليل الصوت عبر Whisper ASR

تحليل النص عبر GPT-4 أو GPT-5

استخراج تقييم من 100 + ملاحظات

عرض النتيجة في واجهة المستخدم

🌐 الخدمات والروابط الخارجية
الخدمة	الاستخدام
SweetAlert2	تنبيهات و Toasts
Google OAuth	تسجيل دخول اجتماعي (مستقبلي)
Whisper (OpenAI)	تحويل الصوت إلى نص
Cloudinary / AWS S3	تخزين الفيديوهات
Tailwind CDN	تصميم سريع أثناء التطوير
🎨 التصميم (UI/UX)

TailwindCSS في كل الصفحات

دعم النمط الفاتح والداكن

مكونات رئيسية:

Buttons (primary / ghost / secondary)

Cards متجاوبة

Sidebar ثابت

Topbar بالاسم والصورة

Toasts و Alerts موحدة من lib/alerts.js

🧪 الاختبارات (Testing)

تم اختبار:

التوجيهات (Routing)

تسجيل الدخول والخروج

المقابلة بالفيديو

الحماية (PrivateRoute + RoleRoute)

📦 البناء والنشر
npm run build


المخرجات في /dist ويمكن نشرها على:

Netlify

Vercel

GitHub Pages

أو أي سيرفر Node.js

⚙️ إعداد Tailwind CSS

الملفات:

tailwind.config.js
postcss.config.js
index.css


تثبيت Tailwind:

npx tailwindcss init -p

🧑‍💻 المساهمون
NOUR MOSTAFA --- Ui /Ux
Yahia Mohamed — Frontend Developer & System Designer
Nada Mohamed -- Frontend Developer & System Designer



📡 التكامل المقترح مع Backend
العنصر	الوصف
API Server	Node.js + Express
Database	MongoDB / PostgreSQL
Auth	JWT / OAuth
Video Upload	S3 / Cloudinary
AI Pipeline	Whisper + GPT-4 Evaluation
Endpoints	/api/interviews, /api/jobs, /api/users
🔗 API Endpoints التفصيلية
🧍 المستخدمين (Users)
الطريقة	المسار	الوظيفة
POST	/api/auth/signup	إنشاء حساب جديد
POST	/api/auth/login	تسجيل الدخول وإرجاع JWT
GET	/api/users/profile	جلب بيانات المستخدم الحالي
PUT	/api/users/profile	تحديث بيانات المستخدم
DELETE	/api/users/:id	حذف مستخدم
💼 الوظائف (Jobs)
الطريقة	المسار	الوظيفة
GET	/api/jobs	جلب جميع الوظائف
POST	/api/jobs	إضافة وظيفة جديدة (HR فقط)
GET	/api/jobs/:id	جلب تفاصيل وظيفة معينة
PUT	/api/jobs/:id	تعديل وظيفة
DELETE	/api/jobs/:id	حذف وظيفة
👤 المتقدمون (Candidates)
الطريقة	المسار	الوظيفة
GET	/api/candidates	جلب جميع المتقدمين
POST	/api/candidates/apply	تقديم طلب لوظيفة
GET	/api/candidates/:id	جلب تفاصيل متقدم
DELETE	/api/candidates/:id	حذف متقدم
🎥 المقابلات (Interviews)
الطريقة	المسار	الوظيفة
GET	/api/interviews	جلب جميع المقابلات
POST	/api/interviews/start	بدء مقابلة جديدة
POST	/api/interviews/submit	تسليم المقابلة النهائية
GET	/api/interviews/:id	جلب تفاصيل مقابلة
POST	/api/interviews/upload	رفع فيديو مقابلة
POST	/api/interviews/evaluate	تقييم المقابلة عبر الذكاء الاصطناعي

نموذج تقييم AI (Response Example):

{
  "overall_score": 84,
  "clarity": 90,
  "relevance": 80,
  "communication": 83,
  "feedback": "إجابات واضحة ومنظمة، حاول إضافة تفاصيل أكثر عن الخبرة التقنية."
}

📄 الترخيص (License)

MIT License © 2026 Job Intel
الاستخدام شخصي أو تعليمي فقط — النشر التجاري يتطلب إذن مسبق.