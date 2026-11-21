import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import type { Role } from "@/types";
import { CompanyDeleteButton } from "@/app/dashboard/companies/company-delete-button";

export default async function DirectoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const role = ((session.user as { role?: Role }).role ?? "editor") as Role;

  const { id } = await params;
  const dirId = Number(id);
  if (isNaN(dirId)) notFound();

  const directory = await prisma.directory.findUnique({
    where: { id: dirId },
    include: { companies: { orderBy: { createdAt: "desc" } } },
  });
  if (!directory) notFound();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/directories" className="text-sm text-muted-foreground hover:underline">
              ← Directories
            </Link>
          </div>
          <h1 className="text-2xl font-bold mt-1">{directory.area}</h1>
          <p className="text-sm text-muted-foreground">
            {directory.thana}, {directory.district}, {directory.country}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/directories/${directory.id}/edit`}>
            <Button variant="outline">Edit Directory</Button>
          </Link>
          <Link href={`/dashboard/companies/new?directoryId=${directory.id}`}>
            <Button>New Company</Button>
          </Link>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-3">
        Companies ({directory.companies.length})
      </h2>

      {directory.companies.length === 0 ? (
        <div className="border rounded-lg p-8 text-center text-muted-foreground">
          No companies yet.{" "}
          <Link
            href={`/dashboard/companies/new?directoryId=${directory.id}`}
            className="text-primary underline"
          >
            Add one
          </Link>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Phone</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {directory.companies.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3 text-sm">{c.type}</td>
                  <td className="p-3 text-sm">{c.phone ?? "-"}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/companies/${c.id}/edit`}>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                      {role === "admin" && (
                        <CompanyDeleteButton id={c.id} name={c.name} />
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