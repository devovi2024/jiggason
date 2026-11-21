import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { DirectoryForm } from "../../directory-form";
import { updateDirectoryAction } from "../../actions";

export default async function EditDirectoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const dirId = Number(id);
  if (isNaN(dirId)) notFound();

  const dir = await prisma.directory.findUnique({ where: { id: dirId } });
  if (!dir) notFound();

  const boundAction = updateDirectoryAction.bind(null, dirId);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Edit Directory</h1>
      <DirectoryForm
        initialData={{
          id: dir.id,
          area: dir.area,
          district: dir.district,
          country: dir.country,
          thana: dir.thana,
        }}
        action={boundAction}
        submitLabel="Update"
        cancelHref={`/dashboard/directories/${dirId}`}
      />
    </div>
  );
}