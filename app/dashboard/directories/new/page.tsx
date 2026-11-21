import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DirectoryForm } from "../directory-form";
import { createDirectoryAction } from "../actions";

export default async function NewDirectoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">New Directory</h1>
      <DirectoryForm action={createDirectoryAction} submitLabel="Create" />
    </div>
  );
}