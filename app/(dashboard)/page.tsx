import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/require-access";
import { getRoleRedirect } from "@/lib/auth/page-access";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  
  redirect(getRoleRedirect(user.role));
}