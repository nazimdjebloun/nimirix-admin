
import { ForgotPasswordEmail } from "@/lib/email/auth/templates/ForgotPasswordEmail";
import { isAuthenticated } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export default async function EmailPreviewPage() {
    if (!(await isAuthenticated())) {
      redirect("/login");
    }
    
  const html = ForgotPasswordEmail({
    userEmail: "test@test.com",
    resetLink: "https://nimirix.com/reset-password?token=example",
  });

  return (
    <div className="min-h-screen bg-zinc-950 p-8 flex flex-col items-center">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Email Template Preview</h1>
        <p className="text-zinc-400 text-sm">This is how your password reset email will look to users.</p>
      </div>
      
      {/* Container to mimic an email client */}
      <div className="w-full max-w-2xl border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="size-2.5 rounded-full bg-red-500/50" />
            <div className="size-2.5 rounded-full bg-amber-500/50" />
            <div className="size-2.5 rounded-full bg-green-500/50" />
          </div>
          <div className="text-[11px] text-zinc-500 font-medium ml-2">New Message: Reset your password</div>
        </div>
        <div 
          className="bg-transparent"
          dangerouslySetInnerHTML={{ __html: html }} 
        />
      </div>
    </div>
  );
}
