export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();

    const clientId = config.oauth.facebook.clientId;
    const redirectUri = `${config.public.baseUrl}/api/v1/auth/facebook/callback`;

    // สร้าง state สำหรับป้องกัน CSRF
    const state = Math.random().toString(36).substring(7);

    // เก็บ state ไว้ใน cookie เพื่อตรวจสอบทีหลัง
    setCookie(event, "oauth_state_fb", state, {
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
        scope: "email,public_profile",
        state,
    });

    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;

    return sendRedirect(event, authUrl, 302);
});
