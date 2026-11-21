import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { CompanyForm } from "../company-form";
import { createCompanyAction } from "../actions";

export default async function NewCompanyPage({
  searchParams,
}: {
  searchParams: Promise<{ directoryId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { directoryId: dId } = await searchParams;
  const directoryId = Number(dId);
  if (isNaN(directoryId)) notFound();

  const directory = await prisma.directory.findUnique({
    where: { id: directoryId },
  });
  if (!directory) notFound();

  return (
    <div className="p-8">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Adding company to{" "}
          <span className="font-semibold">{directory.area}</span>,{" "}
          {directory.district}
        </p>
        <h1 className="text-2xl font-bold mt-1">New Company</h1>
      </div>
      <CompanyForm
        directoryId={directoryId}
        cancelHref={`/dashboard/directories/${directoryId}`}
        action={createCompanyAction}
        submitLabel="Create"
      />
    </div>
  );
}