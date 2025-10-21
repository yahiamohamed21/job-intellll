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

job-intel/
├── public/
│   ├── login-illustration.svg
│   └── ...
├── src/
│   ├── auth/
│   │   ├── AuthProvider.jsx
│   │   └── useAuth.js
│   ├── hooks/
│   │   ├── useConfirmLogout.js
│   │   └── ...
│   ├── layout/
│   │   ├── employee/
│   │   │   ├── EmployeeLayout.jsx
│   │   │   ├── Topbar.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── hr/
│   │   │   ├── HRLayout.jsx
│   │   │   ├── SidebarInline.jsx
│   │   │   └── Topbar.jsx
│   ├── lib/
│   │   ├── alerts.js
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── About.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── employee/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Tests.jsx
│   │   │   ├── Jobs.jsx
│   │   │   ├── VideoInterview.jsx
│   │   │   └── Settings.jsx
│   │   ├── hr/
│   │   │   ├── HRDashboard.jsx
│   │   │   ├── HRJobs.jsx
│   │   │   ├── HRCandidates.jsx
│   │   │   ├── HRNotifications.jsx
│   │   │   └── HRSettings.jsx
│   ├── routes/
│   │   ├── PrivateRoute.jsx
│   │   └── RoleRoute.jsx
│   ├── App.jsx
│   └── main.jsx
└── package.json

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

Vercel

GitHub Pages >>  https://github.com/yahiamohamed21/job-intellll

أو أي سيرفر Node.js

⚙️ إعداد Tailwind CSS

الملفات:

tailwind.config.js
postcss.config.js
index.css


تثبيت Tailwind:

npx tailwindcss init -p

 # create Dashboard BY
#Yahia Mohamed — Frontend Developer  


📡 التكامل المقترح مع Backend
العنصر	الوصف
API Server	Node.js + Express
Database	MongoDB / PostgreSQL
Auth	JWT / OAuth
Video Upload	S3 / Cloudinary
AI Pipeline	Whisper + GPT-4 Evaluation
Endpoints	/api/interviews, /api/jobs, /api/users
