import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AccountShell } from "@/components/shells";
import { getCurrentUser } from "@/lib/auth";

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/prijava?next=/nalog");
  return <AccountShell>{children}</AccountShell>;
}
