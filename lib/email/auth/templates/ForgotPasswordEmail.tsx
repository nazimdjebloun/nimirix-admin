
export function ForgotPasswordEmail({ userEmail, resetLink }: { userEmail: string; resetLink: string }) {
  return `
    <div style="background-color: #f4f4f5; padding: 60px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; min-height: 100%;">
      <div style="background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; max-width: 500px; margin: 0 auto; padding: 40px;">
        
        <div style="margin-bottom: 30px; text-align: center;">
          <span style="font-size: 20px; font-weight: bold; color: #18181b;">Nimirix <span style="color: #3b82f6;">Admin</span></span>
        </div>
        
        <h1 style="font-size: 24px; font-weight: bold; color: #18181b; margin-bottom: 16px;">Reset your password</h1>
        
        <p style="font-size: 16px; color: #52525b; line-height: 1.6; margin-bottom: 24px;">
          Hello,<br/><br/>
          We received a request to reset the password for your account associated with <strong>${userEmail}</strong>.
        </p>
        
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${resetLink}" style="display: inline-block; background-color: #18181b; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px;">
            Reset Password
          </a>
        </div>
        
        <p style="font-size: 14px; color: #71717a; line-height: 1.6; margin-bottom: 0;">
          This link will expire in 30 minutes. If you didn't request this, you can safely ignore this email.
        </p>
        
        <p style="font-size: 12px; color: #a1a1aa; line-height: 1.6; margin-top: 24px;">
          If the button doesn't work, copy and paste the following URL into your browser:
        </p>
        <p style="font-size: 12px; margin-top: 8px; word-break: break-all;">
          <span style="color: #3b82f6;">${resetLink}</span>
        </p>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e4e4e7; text-align: center;">
          <p style="font-size: 12px; color: #a1a1aa;">
            &copy; ${new Date().getFullYear()} Nimirix Software. All rights reserved.
          </p>
        </div>
      </div>
      
      <div style="font-size: 12px; color: #71717a; margin-top: 24px; text-align: center;">
        You are receiving this email because a password reset was requested for your account.
      </div>
    </div>
  `;
}