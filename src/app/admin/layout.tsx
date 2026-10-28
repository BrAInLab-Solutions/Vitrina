import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/shells";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/prijava?next=/admin");
  if (user.role !== "ADMIN") redirect("/");
  return <AdminShell>{children}</AdminShell>;
}
