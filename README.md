# 🌟 DreamBuddy (เพื่อนล่าฝัน) 🎯💰

**Turn Your Dreams Into Reality** - แอปพลิเคชันจัดการการออมเงินเพื่อเป้าหมายความฝัน พร้อมระบบชุมชนที่ให้กำลังใจซึ่งกันและกัน

## 📖 รายละเอียดโปรเจค

DreamBuddy เป็นแอปพลิเคชันเว็บแบบ Full-stack ที่ช่วยให้ผู้ใช้สามารถ:

-   ✨ สร้างและติดตามเป้าหมายการออมเงิน
-   💰 บันทึกรายการออม/ถอนเงิน
-   🌍 แชร์เป้าหมายให้คนอื่นเห็นและให้กำลังใจ
-   ❤️ กด Like และคอมเมนต์ให้กำลังใจเป้าหมายของคนอื่น
-   🔒 เลือกระดับความเป็นส่วนตัวของเป้าหมาย (Private, Public, Link Only)

## 🛠️ Tech Stack

### Frontend

-   **Nuxt 4** - Vue.js Framework
-   **Vue 3** - Progressive JavaScript Framework
-   **Tailwind CSS 4** - Utility-first CSS Framework
-   **Nuxt UI** - UI Component Library

### Backend

-   **Nuxt Server API** - API Routes
-   **Prisma ORM** - Database ORM
-   **PostgreSQL** - Database
-   **JWT** - Authentication
-   **bcryptjs** - Password Hashing
-   **Nodemailer** - Email Service

### Features

-   🌐 **Multi-language (i18n)** - รองรับภาษาอังกฤษและไทย
-   🔐 **Authentication** - Login, Register, Password Reset
-   🔑 **OAuth** - Google และ Facebook Login
-   🎨 **Theme Toggle** - Light/Dark Mode
-   📱 **Responsive Design** - ใช้งานได้ทุกอุปกรณ์

## 📊 Database Schema

### Models หลัก:

-   **User** - ข้อมูลผู้ใช้ (username, email, OAuth providers)
-   **Goal** - เป้าหมายการออมเงิน (title, target amount, target date, visibility)
-   **Transaction** - รายการเงินเคลื่อนไหว (deposit/withdraw)
-   **GoalLike** - การกดถูกใจเป้าหมาย
-   **GoalComment** - ความคิดเห็นและกำลังใจ

### Goal Visibility Modes:

-   `PRIVATE` - เห็นได้เฉพาะเจ้าของ
-   `PUBLIC` - แสดงใน Explore/โปรไฟล์
-   `LINK_ONLY` - เข้าถึงได้เฉพาะคนที่มีลิงก์

## 🚀 การติดตั้งและใช้งาน

### 1. Clone Repository

```bash
git clone <repository-url>
cd dreambuddy-nuxt4-prisma-postgresql
```

### 2. ติดตั้ง Dependencies

```bash
bun install
# หรือ
npm install
```

### 3. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ที่ root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dreambuddy"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key"

# OAuth - Google
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# OAuth - Facebook
FACEBOOK_CLIENT_ID="your-facebook-client-id"
FACEBOOK_CLIENT_SECRET="your-facebook-client-secret"

# Email (สำหรับ Password Reset)
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-email-app-password"

# Base URL
NUXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 4. ตั้งค่า Database

```bash
# สร้าง migrations
bunx prisma migrate dev

# (Optional) Seed ข้อมูลตัวอย่าง
bunx prisma db seed
```

### 5. Generate Prisma Client

```bash
bunx prisma generate
```

### 6. รัน Development Server

```bash
bun run dev
# หรือ
npm run dev
```

เปิดเบราว์เซอร์ที่ `http://localhost:3000`

## 📁 โครงสร้างโปรเจค

```
dreambuddy-nuxt4-prisma-postgresql/
├── app/                          # Frontend Application
│   ├── components/              # Vue Components
│   │   ├── App/                # App-wide Components
│   │   └── Landing/            # Landing Page Components
│   ├── composables/            # Composable Functions
│   ├── layouts/                # Layout Templates
│   ├── locales/                # i18n Translation Files
│   ├── middleware/             # Route Middleware
│   ├── pages/                  # Application Pages
│   │   ├── auth/              # Authentication Pages
│   │   └── goals/             # Goals Management Pages
│   └── plugins/                # Nuxt Plugins
├── server/                      # Backend API
│   ├── api/v1/                 # API Routes
│   │   ├── auth/              # Authentication Endpoints
│   │   ├── explore/           # Explore Goals
│   │   └── goals/             # Goals CRUD & Features
│   ├── middleware/            # Server Middleware
│   └── utils/                 # Server Utilities
├── prisma/                      # Database
│   ├── schema.prisma          # Prisma Schema
│   ├── migrations/            # Database Migrations
│   └── seed.ts                # Seed Data
└── public/                      # Static Files
```

## 🔌 API Endpoints

### Authentication

-   `POST /api/v1/auth/register` - สมัครสมาชิก
-   `POST /api/v1/auth/login` - เข้าสู่ระบบ
-   `POST /api/v1/auth/logout` - ออกจากระบบ
-   `GET /api/v1/auth/me` - ข้อมูลผู้ใช้ปัจจุบัน
-   `POST /api/v1/auth/forgot-password` - ขอรีเซ็ตรหัสผ่าน
-   `POST /api/v1/auth/reset-password` - รีเซ็ตรหัสผ่าน

### OAuth

-   `GET /api/v1/auth/google/redirect` - Google OAuth
-   `GET /api/v1/auth/facebook/redirect` - Facebook OAuth

### Goals

-   `GET /api/v1/goals` - รายการเป้าหมายของผู้ใช้
-   `POST /api/v1/goals` - สร้างเป้าหมายใหม่
-   `GET /api/v1/goals/:id` - ดูรายละเอียดเป้าหมาย
-   `PUT /api/v1/goals/:id` - แก้ไขเป้าหมาย
-   `DELETE /api/v1/goals/:id` - ลบเป้าหมาย

### Goal Features

-   `POST /api/v1/goals/:id/like` - กด Like เป้าหมาย
-   `GET /api/v1/goals/:id/likes` - รายการ Likes
-   `GET /api/v1/goals/:id/comments` - รายการคอมเมนต์
-   `POST /api/v1/goals/:id/comments` - เพิ่มคอมเมนต์
-   `PUT /api/v1/goals/:id/comments/:commentId` - แก้ไขคอมเมนต์
-   `DELETE /api/v1/goals/:id/comments/:commentId` - ลบคอมเมนต์

### Transactions

-   `GET /api/v1/goals/:id/transactions` - รายการเงินเคลื่อนไหว
-   `POST /api/v1/goals/:id/transactions` - บันทึกการออม/ถอนเงิน

### Explore

-   `GET /api/v1/explore/goals` - สำรวจเป้าหมายสาธารณะ

## 🧪 Prisma Commands

```bash
# เปิด Prisma Studio (GUI สำหรับดูข้อมูลในฐานข้อมูล)
bunx prisma studio

# สร้าง migration ใหม่
bunx prisma migrate dev --name your_migration_name

# Deploy migrations (Production)
bunx prisma migrate deploy

# Reset database
bunx prisma migrate reset

# Format schema.prisma
bunx prisma format
```

## 🏗️ Production Build

```bash
# Build สำหรับ Production
bun run build

# Preview Production Build
bun run preview
```

## 🌍 Deployment

แอปพลิเคชันนี้สามารถ deploy ได้บน:

-   **Vercel** (แนะนำสำหรับ Nuxt)
-   **Netlify**
-   **Railway** (สำหรับ PostgreSQL Database)
-   **Heroku**
-   **DigitalOcean**

สำหรับข้อมูลเพิ่มเติม: [Nuxt Deployment Documentation](https://nuxt.com/docs/getting-started/deployment)

## 👨‍💻 Author

สร้างด้วย ❤️ โดยใช้ Nuxt 4 + Prisma + PostgreSQL
