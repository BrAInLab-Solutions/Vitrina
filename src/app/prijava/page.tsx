import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";
import { safeNextPath } from "@/lib/http";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getCurrentUser()) redirect("/nalog");
  const params = await searchParams;
  return <AuthForm mode="login" nextPath={safeNextPath(params.next)} />;
}
