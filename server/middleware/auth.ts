import { verifyToken } from "../utils/auth";

export default defineEventHandler((event) => {
    // console.log("Auth middleware triggered");

    const token = getCookie(event, "dreambuddy_token");

    if (token) {
        const payload = verifyToken(token);

        if (payload) {
            event.context.auth = payload;
        }
    }
});
