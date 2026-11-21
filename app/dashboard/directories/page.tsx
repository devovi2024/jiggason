import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import type { Role } from "@/types";
import { DeleteButton } from "./delete-button";

export default async function DirectoriesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const role = ((session.user as { role?: Role }).role ?? "editor") as Role;

  const directories = await prisma.directory.findMany({
    orderBy: { id: "desc" },
    include: { _count: { select: { companies: true } } },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Directories</h1>
          <p className="text-sm text-muted-foreground">
            {directories.length}{" "}
            {directories.length === 1 ? "directory" : "directories"}
          </p>
        </div>
        <Link
          href="/dashboard/directories/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + New Directory
        </Link>
      </div>

      {directories.length === 0 ? (
        <div className="border rounded-lg p-8 text-center text-muted-foreground">
          No directories yet.{" "}
          <Link
            href="/dashboard/directories/new"
            className="text-blue-600 underline"
          >
            Create one
          </Link>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-3">Area</th>
                <th className="text-left p-3">District</th>
                <th className="text-left p-3">Thana</th>
                <th className="text-left p-3">Companies</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {directories.map((d) => (
                <tr key={d.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">
                    <Link
                      href={`/dashboard/directories/${d.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {d.area}
                    </Link>
                  </td>
                  <td className="p-3">{d.district}</td>
                  <td className="p-3">{d.thana}</td>
                  <td className="p-3">{d._count.companies}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/dashboard/directories/${d.id}`}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                      >
                        View
                      </Link>
                      <Link
                        href={`/dashboard/directories/${d.id}/edit`}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                      >
                        Edit
                      </Link>
                      {role === "admin" && (
                        <DeleteButton id={d.id} name={d.area} />
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