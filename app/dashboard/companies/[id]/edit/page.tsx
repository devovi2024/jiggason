import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { CompanyForm } from "../../company-form";
import { updateCompanyAction } from "../../actions";

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const companyId = Number(id);
  if (isNaN(companyId)) notFound();

  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });
  if (!company) notFound();

  const boundAction = updateCompanyAction.bind(
    null,
    company.id,
    company.directoryId
  );

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Edit Company</h1>
      <CompanyForm
        directoryId={company.directoryId}
        cancelHref={`/dashboard/directories/${company.directoryId}`}
        initialData={{
          id: company.id,
          name: company.name,
          website: company.website,
          type: company.type,
          location: company.location,
          area: company.area,
          thana: company.thana,
          district: company.district,
          country: company.country,
          services: company.services,
          email: company.email,
          phone: company.phone,
          verification_status: company.verification_status,
          job_status: company.job_status,
        }}
        action={boundAction}
        submitLabel="Update"
      />
    </div>
  );
}