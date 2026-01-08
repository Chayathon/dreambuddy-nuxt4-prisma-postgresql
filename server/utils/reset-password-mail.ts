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
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Reset Your Password</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6;">
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td align="center" style="padding: 40px 0;">
                            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                <!-- Header -->
                                <tr>
                                    <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">🌟 DreamBuddy</h1>
                                        <p style="margin: 10px 0 0 0; color: #d1fae5; font-size: 14px;">Make Your Dreams Come True</p>
                                    </td>
                                </tr>
                                
                                <!-- Content -->
                                <tr>
                                    <td style="padding: 40px 30px;">
                                        <h2 style="margin: 0 0 20px 0; color: #047857; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
                                        <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                                            Hello there! 👋
                                        </p>
                                        <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                                            We received a request to reset the password for your DreamBuddy account. Click the button below to create a new password:
                                        </p>
                                        
                                        <!-- Button -->
                                        <table role="presentation" style="margin: 30px 0; border-collapse: collapse;">
                                            <tr>
                                                <td align="center">
                                                    <a href="${resetPasswordUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3); transition: all 0.3s ease;">
                                                        Reset Password
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <p style="margin: 30px 0 20px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                            Or copy and paste this link into your browser:
                                        </p>
                                        <p style="margin: 0 0 20px 0; padding: 12px; background-color: #f0fdf4; border-left: 4px solid #10b981; color: #047857; font-size: 14px; word-break: break-all; border-radius: 4px;">
                                            ${resetPasswordUrl}
                                        </p>
                                        
                                        <div style="margin: 30px 0 0 0; padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                                            <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                                                <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                                
                                <!-- Footer -->
                                <tr>
                                    <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
                                        <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                                            © ${new Date().getFullYear()} DreamBuddy. All rights reserved.
                                        </p>
                                        <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                            This email was sent to ${email}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `,
    };

    await transporter.sendMail(mailOptions);

    return {
        message: "Password reset email sent",
    };
};

export { sendResetPasswordMail };
