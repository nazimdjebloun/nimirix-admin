import { transporter } from "../nodemailer";

/**
 * Utility to handle email sending.
 * In development, we log the information to the console.
 * In production, we use Nodemailer with Gmail.
 */
export async function sendEmail({ to, subject, text, html }: {
    to: string;
    subject: string;
    text: string;
    html?: string;
}) {
    if (process.env.NODE_ENV === "development") {
        console.log("------------------------------------------");
        console.log(`📧 Email to: ${to}`);
        console.log(`📝 Subject: ${subject}`);
        console.log(`📖 Content: ${text}`);
        console.log("------------------------------------------");
        return;
    }

    try {
        await transporter.sendMail({
            from: `"Nimirix Admin" <${process.env.GMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        });
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email");
    }
}