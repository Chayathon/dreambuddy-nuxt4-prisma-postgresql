export default defineNuxtRouteMiddleware(async (to, from) => {
    const token = to.query.token as string | undefined;

    if (!token) {
        console.log("No token provided in query parameters.");
        return navigateTo("/auth/forgot-password?reset_error=no_token", {
            replace: true,
        });
    }

    try {
        await $fetch("/api/v1/auth/verify-reset-token", {
            query: { token },
        });
    } catch {
        console.log("Invalid or expired reset token.");
        return navigateTo("/auth/forgot-password?reset_error=invalid_token", {
            replace: true,
        });
    }
});
