"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import nodemailer from "nodemailer";
import { ForgotPasswordEmail } from "@/lib/email/auth/templates/ForgotPasswordEmail";

/**
 * Sends a password reset email using the Nimirix Admin brand styling.
 */
export const sendResetPassword = action({
  args: {
    email: v.string(),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Nimirix Admin" <${process.env.GMAIL_USER}>`,
      to: args.email,
      subject: "Reset Password",
      text: `Reset your password here: ${args.url}`,
      html: ForgotPasswordEmail({ 
        userEmail: args.email, 
        resetLink: args.url 
      }),
    });
  },
});
