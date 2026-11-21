import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import type { Role } from "@/types";
import { DeleteButton } from "./delete-button";

export default async function OrganizationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const role = ((session.user as { role?: Role }).role ??
    "editor") as Role;

  const organizations = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Organizations</h1>
          <p className="text-sm text-muted-foreground">
            {organizations.length} organization
            {organizations.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/dashboard/organizations/new">
          <Button>New Organization</Button>
        </Link>
      </div>

      {organizations.length === 0 ? (
        <div className="border rounded-lg p-8 text-center text-muted-foreground">
          No organizations yet.{" "}
          <Link
            href="/dashboard/organizations/new"
            className="text-primary underline"
          >
            Create one
          </Link>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Kind</th>
                <th className="text-left p-3">Website</th>
                <th className="text-left p-3">Email</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {organizations.map((org) => (
                <tr key={org.id} className="border-t">
                  <td className="p-3 font-medium">{org.name}</td>
                  <td className="p-3 capitalize">{org.kind}</td>
                  <td className="p-3 text-sm">{org.website ?? "-"}</td>
                  <td className="p-3 text-sm">{org.email ?? "-"}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/organizations/${org.id}/edit`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      {role === "admin" && (
                        <DeleteButton id={org.id} name={org.name} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}