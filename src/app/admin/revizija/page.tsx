import { prisma } from "@/lib/db";

export default async function AuditPage() {
  const logs = await prisma.auditLog.findMany({ include: { actor: true }, orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <div>
      <h1 className="serif text-4xl">Revizija</h1>
      <p className="mt-2 text-sm text-muted">Administrativne radnje ostaju u evidenciji.</p>
      <div className="table-wrap mt-6">
        <table>
          <thead><tr><th>Vreme</th><th>Ko</th><th>Radnja</th><th>Zapis</th></tr></thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{log.createdAt.toLocaleString("sr-Latn-RS")}</td>
                <td>{log.actor?.email ?? "sistem"}</td>
                <td>{log.action}<br /><span className="text-muted">{log.entity}</span></td>
                <td className="max-w-xs break-words text-xs text-muted">{log.meta}</td>
              </tr>
            ))}
            {logs.length === 0 && <tr><td colSpan={4}>Još nema zabeleženih radnji.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
