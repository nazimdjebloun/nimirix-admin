import nodemailer from "nodemailer";

const user = process.env.GMAIL_USER;
const pass = process.env.GMAIL_APP_PASSWORD;

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user,
        pass,
    },
});

// Verify connection configuration
if (user && pass) {
    transporter.verify(function (error, success) {
        if (error) {
            console.error("❌ Nodemailer verification failed:", error);
        } else {
            console.log("✅ Nodemailer is ready to send emails", success);
        }
    });
}

