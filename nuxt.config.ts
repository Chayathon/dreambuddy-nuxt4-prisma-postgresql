import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2025-07-15",
    devtools: { enabled: true },
    css: ["./app/assets/css/main.css"],
    runtimeConfig: {
        // Private keys - ใช้ได้เฉพาะฝั่ง server
        jwtSecret: process.env.JWT_SECRET || "your-secret-key-change-this",
        oauth: {
            google: {
                clientId: process.env.GOOGLE_CLIENT_ID || "",
                clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            },
            facebook: {
                clientId: process.env.FACEBOOK_CLIENT_ID || "",
                clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
            },
        },
        // Public keys - ใช้ได้ทั้งฝั่ง client และ server
        public: {
            baseUrl:
                process.env.NUXT_PUBLIC_BASE_URL || "http://localhost:3000",
        },
    },
    modules: [
        "@nuxt/ui",
        [
            "nuxt-i18n-micro",
            {
                locales: [
                    { code: "en", iso: "en-US", name: "English", dir: "ltr" },
                    { code: "th", iso: "th-TH", name: "ไทย", dir: "ltr" },
                ],
                defaultLocale: "en", // ตั้งค่าภาษาเริ่มต้นเป็นอังกฤษ
                translationDir: "app/locales", // โฟลเดอร์ที่เก็บไฟล์แปลภาษา
                meta: true, // เปิดใช้งานการจัดการ meta tags สำหรับ SEO
                autoDetectLanguage: false, // ปิดการตรวจจับภาษาของเบราว์เซอร์
                includeDefaultLocaleRoute: false, // ไม่รวมรหัสภาษาสำหรับภาษาเริ่มต้นใน URL
                types: "all", // สร้างไทป์สำหรับทุกภาษา
                disablePageLocales: true, // ปิดการใช้งานการสร้างหน้าแยกตามภาษา
            },
        ],
        [
            "@nuxtjs/google-fonts",
            {
                families: {
                    Inter: "200..700",
                    Anuphan: ["400", "500"],
                },
                display: "swap",
                preload: true,
                prefetch: true,
                preconnect: true,
                download: true,
                inject: true,
            },
        ],
    ],
    vite: {
        plugins: [tailwindcss()],
    },
});
