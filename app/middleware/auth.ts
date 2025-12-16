export default defineNuxtRouteMiddleware(async (to, from) => {
    // console.log("Auth middleware triggered");

    const token = useCookie("dreambuddy_token").value;

    if (!token) {
        return navigateTo("/auth/login");
    }
});
