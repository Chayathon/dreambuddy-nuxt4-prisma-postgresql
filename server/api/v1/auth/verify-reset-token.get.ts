import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const token = query.token as string;

    const config = useRuntimeConfig();

    try {
        jwt.verify(token, config.jwtSecret);
        return { valid: true };
    } catch (error) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid or expired token",
        });
    }
});
