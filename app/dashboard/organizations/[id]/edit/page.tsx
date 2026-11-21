import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { OrganizationForm } from "../../organization-form";
import { updateOrganizationAction } from "../../actions";

export default async function EditOrganizationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const orgId = Number(id);
  if (isNaN(orgId)) notFound();

  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) notFound();

  const boundAction = updateOrganizationAction.bind(null, orgId);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Edit Organization</h1>
      <OrganizationForm
        initialData={{
          id: org.id,
          kind: org.kind,
          name: org.name,
          org: org.org,
          website: org.website,
          email: org.email,
          phone: org.phone,
        }}
        action={boundAction}
        submitLabel="Update"
      />
    </div>
  );
}