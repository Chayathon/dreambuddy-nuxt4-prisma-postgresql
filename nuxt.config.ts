import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2025-07-15",
    devtools: { enabled: true },
    css: ["./app/assets/css/main.css"],
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
