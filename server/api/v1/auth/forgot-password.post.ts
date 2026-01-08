import { prisma } from "../../../utils/prisma";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { sendResetPasswordMail } from "~~/server/utils/reset-password-mail";

const forgotPasswordSchema = z.object({
    email: z.string().refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
        message: "Invalid email address",
    }),
});

const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid data",
            data: parsed.error.issues,
        });
    }

    const { email } = parsed.data;

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw createError({
            statusCode: 404,
            statusMessage: "User not found",
        });
    }

    if (user.passwordHash === null || user.passwordHash === "") {
        throw createError({
            statusCode: 400,
            statusMessage: "Users not registered via email/password",
        });
    }

    const token = jwt.sign({ userId: user.id }, config.jwtSecret, {
        expiresIn: "5m",
    });

    await sendResetPasswordMail(email, token);
});
