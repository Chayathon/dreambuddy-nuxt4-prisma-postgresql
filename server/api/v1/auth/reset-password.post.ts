import z from "zod";
import jwt from "jsonwebtoken";

const newPasswordSchema = z.object({
    token: z.string().min(1, { message: "Token is required" }),
    newPassword: z
        .string()
        .min(6, { message: "Password must be at least 6 characters" }),
});

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const parsed = newPasswordSchema.safeParse(body);

    if (!parsed.success) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid data",
            data: parsed.error.issues,
        });
    }

    const { token, newPassword } = parsed.data;
    const config = useRuntimeConfig();

    let payload: { userId: string };
    try {
        payload = jwt.verify(token, config.jwtSecret) as { userId: string };
    } catch (error) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid token",
        });
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
        where: { id: Number(payload.userId) },
        data: { passwordHash: hashedPassword },
    });

    return { success: true };
});
