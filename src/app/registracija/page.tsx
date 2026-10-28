import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/nalog");
  return (
    <div>
      <AuthForm mode="register" nextPath="/nalog" />
      <p className="wrap -mt-8 pb-10 text-sm text-muted">
        Već imate nalog? <Link href="/prijava" className="text-gold">Prijavite se</Link>
      </p>
    </div>
  );
}
