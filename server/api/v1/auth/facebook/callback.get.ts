import { signToken, setAuthCookie } from "../../../../utils/auth";
import { prisma } from "../../../../utils/prisma";
import type { OAuthTokenResponse, OAuthUserInfo } from "../types";

interface FacebookUserInfoResponse {
    id: string;
    name: string;
    email: string;
    picture?: {
        data: {
            url: string;
        };
    };
}

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const query = getQuery(event);

    const code = query.code as string;
    const state = query.state as string;

    // ตรวจสอบ state เพื่อป้องกัน CSRF
    const savedState = getCookie(event, "oauth_state_fb");
    if (!state || state !== savedState) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid state parameter",
        });
    }

    // ลบ state cookie
    deleteCookie(event, "oauth_state_fb");

    if (!code) {
        throw createError({
            statusCode: 400,
            statusMessage: "Authorization code not found",
        });
    }

    try {
        // แลก code กับ access token
        const tokenResponse = await $fetch<OAuthTokenResponse>(
            "https://graph.facebook.com/v18.0/oauth/access_token",
            {
                params: {
                    client_id: config.oauth.facebook.clientId,
                    client_secret: config.oauth.facebook.clientSecret,
                    redirect_uri: `${config.public.baseUrl}/api/v1/auth/facebook/callback`,
                    code,
                },
            }
        );

        // ดึงข้อมูล user จาก Facebook
        const fbUserInfo = await $fetch<FacebookUserInfoResponse>(
            "https://graph.facebook.com/me",
            {
                params: {
                    fields: "id,name,email,picture",
                    access_token: tokenResponse.access_token,
                },
            }
        );

        // แปลงเป็น OAuthUserInfo format
        const userInfo: OAuthUserInfo = {
            id: fbUserInfo.id,
            name: fbUserInfo.name,
            email: fbUserInfo.email,
            picture: fbUserInfo.picture?.data.url || "",
        };

        if (!userInfo.email) {
            throw createError({
                statusCode: 400,
                statusMessage: "Email not provided by Facebook",
            });
        }

        // เชื่อมต่อฐานข้อมูลและสร้าง/อัพเดท user
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { providerId: userInfo.id, provider: "facebook" },
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
                    provider: "facebook",
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
                    provider: "facebook",
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
        console.error("Facebook OAuth error:", error);
        throw createError({
            statusCode: 500,
            statusMessage: error.message || "Authentication failed",
        });
    }
});
