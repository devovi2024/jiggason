import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OrganizationForm } from "../organization-form";
import { createOrganizationAction } from "../actions";

export default async function NewOrganizationPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">New Organization</h1>
      <OrganizationForm
        action={createOrganizationAction}
        submitLabel="Create"
      />
    </div>
  );
}