import { UserControls } from "@/components/actions";
import { prisma } from "@/lib/db";

export default async function UsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="serif text-4xl">Korisnici</h1>
      <div className="table-wrap mt-6">
        <table>
          <thead>
            <tr><th>Ime</th><th>Uloga</th><th>Kreator</th><th>Radnje</th></tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}<br /><span className="text-muted">{user.email}</span></td>
                <td>{user.role === "ADMIN" ? "Administrator" : "Korisnik"}{user.disabled ? " · onemogućen" : ""}</td>
                <td>{user.isSeller ? (user.sellerVerified ? "Verifikovan" : "Da") : "Ne"}</td>
                <td><UserControls id={user.id} verified={user.sellerVerified} disabled={user.disabled} seller={user.isSeller} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
