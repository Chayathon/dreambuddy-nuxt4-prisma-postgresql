import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2025-07-15",
    devtools: { enabled: true },
    css: ["./app/assets/css/main.css"],
    modules: [
        "@nuxt/ui",
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
