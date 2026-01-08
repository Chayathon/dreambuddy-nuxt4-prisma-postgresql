import nodemailer from "nodemailer";

const config = useRuntimeConfig();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: config.emailUser,
        pass: config.emailPass,
    },
});

const sendResetPasswordMail = async (email: string, token: string) => {
    const resetPasswordUrl = `${
        config.public.baseUrl
    }/auth/reset-password?token=${encodeURIComponent(token)}`;

    const mailOptions = {
        from: "DreamBuddy",
        to: email,
        subject: "Password Reset for DreamBuddy",
        html: `
            <p>You requested a password reset for your DreamBuddy account.</p>
            <p>Click the link below to reset your password:</p>
            <p><a href="${resetPasswordUrl}">Reset Password</a></p>
            <p>If you did not request this, please ignore this email.</p>
        `,
    };

    await transporter.sendMail(mailOptions);

    return {
        message: "Password reset email sent",
    };
};

export { sendResetPasswordMail };
