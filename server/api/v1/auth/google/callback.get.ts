import { signToken, setAuthCookie } from "../../../../utils/auth";
import { prisma } from "../../../../utils/prisma";
import type { OAuthTokenResponse, OAuthUserInfo } from "../types";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const query = getQuery(event);

    const code = query.code as string;
    const state = query.state as string;

    // ตรวจสอบ state เพื่อป้องกัน CSRF
    const savedState = getCookie(event, "oauth_state_google");
    if (!state || state !== savedState) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid state parameter",
        });
    }

    // ลบ state cookie
    deleteCookie(event, "oauth_state_google");

    if (!code) {
        throw createError({
            statusCode: 400,
            statusMessage: "Authorization code not found",
        });
    }

    try {
        // แลก code กับ access token
        const tokenResponse = await $fetch<OAuthTokenResponse>(
            "https://oauth2.googleapis.com/token",
            {
                method: "POST",
                body: {
                    code,
                    client_id: config.oauth.google.clientId,
                    client_secret: config.oauth.google.clientSecret,
                    redirect_uri: `${config.public.baseUrl}/api/v1/auth/google/callback`,
                    grant_type: "authorization_code",
                },
            }
        );

        // ดึงข้อมูล user จาก Google
        const userInfo = await $fetch<OAuthUserInfo>(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            {
                headers: {
                    Authorization: `Bearer ${tokenResponse.access_token}`,
                },
            }
        );

        // เชื่อมต่อฐานข้อมูลและสร้าง/อัพเดท user
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { providerId: userInfo.id, provider: "google" },
                    { email: userInfo.email },
                ],
            },
        });

        if (user) {
            // อัพเดท user ที่มีอยู่
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    name: userInfo.name,
                    avatarUrl: userInfo.picture,
                    provider: "google",
                    providerId: userInfo.id,
                },
            });
        } else {
            // สร้าง user ใหม่
            const username =
                userInfo.email.split("@")[0] +
                "_" +
                Math.random().toString(36).substring(7);

            user = await prisma.user.create({
                data: {
                    email: userInfo.email,
                    name: userInfo.name,
                    username,
                    avatarUrl: userInfo.picture,
                    provider: "google",
                    providerId: userInfo.id,
                    passwordHash: null, // OAuth users ไม่มี password
                },
            });
        }

        // สร้าง JWT token (ใช้รูปแบบที่ middleware คาดหวัง)
        const token = signToken({ userId: user.id });

        // เซ็ต session cookie ด้วย helper ของระบบ (ชื่อ cookie ตรงกับ middleware)
        setAuthCookie(event, token);

        // Redirect กลับไปที่หน้า goals
        return sendRedirect(event, "/goals", 302);
    } catch (error: any) {
        console.error("Google OAuth error:", error);
        throw createError({
            statusCode: 500,
            statusMessage: error.message || "Authentication failed",
        });
    }
});
