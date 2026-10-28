import { prisma } from "@/lib/db";

type Note = { type: string; title: string; body: string; href?: string };

export async function notify(userId: string, note: Note) {
  await prisma.notification.create({
    data: {
      userId,
      type: note.type,
      title: note.title,
      body: note.body,
      href: note.href ?? "",
    },
  });
}

export async function audit(actorId: string | null, action: string, entity: string, entityId = "", meta: unknown = {}) {
  await prisma.auditLog.create({
    data: {
      actorId,
      action,
      entity,
      entityId,
      meta: JSON.stringify(meta),
    },
  });
}
