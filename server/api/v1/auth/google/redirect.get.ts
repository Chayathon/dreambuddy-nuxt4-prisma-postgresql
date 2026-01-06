export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();

    const clientId = config.oauth.google.clientId;
    const redirectUri = `${config.public.baseUrl}/api/v1/auth/google/callback`;

    // สร้าง state สำหรับป้องกัน CSRF
    const state = Math.random().toString(36).substring(7);

    // เก็บ state ไว้ใน cookie เพื่อตรวจสอบทีหลัง
    setCookie(event, "oauth_state_google", state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 600, // 10 นาที
        path: "/",
    });

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid email profile",
        state,
        access_type: "offline",
        prompt: "consent",
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    return sendRedirect(event, authUrl, 302);
});
