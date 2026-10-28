import Link from "next/link";
import { MarkRead } from "@/components/actions";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const notes = await prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 });
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="serif text-4xl">Obaveštenja</h1>
        <MarkRead />
      </div>
      <p className="mt-2 text-sm text-muted">Poruke su unutar aplikacije. Slanje e-pošte nije povezano u ovoj verziji.</p>
      <div className="mt-6 grid gap-3">
        {notes.length === 0 && <p className="text-muted">Nemate obaveštenja.</p>}
        {notes.map((note) => (
          <article key={note.id} className={`panel ${note.read ? "opacity-70" : ""}`}>
            <p className="text-sm text-gold">{note.title}</p>
            <p className="mt-2 leading-6">{note.body}</p>
            <p className="mt-2 text-xs text-muted">{note.createdAt.toLocaleString("sr-Latn-RS")}</p>
            {note.href && <Link className="mt-2 inline-block text-sm text-gold" href={note.href}>Otvori</Link>}
          </article>
        ))}
      </div>
    </div>
  );
}
