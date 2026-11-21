import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LogoutButton } from "./logout-button";
import type { Role } from "@/types";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const role = (session.user as { role?: Role }).role ?? "editor";

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-1">Welcome, {session.user?.name}</p>
          <p className="text-sm text-muted-foreground">Role: {role}</p>
        </div>
        <LogoutButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        <Link
          href="/dashboard/organizations"
          className="border rounded-lg p-6 hover:bg-accent transition"
        >
          <h2 className="text-lg font-semibold">Organizations</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage government and non-government organizations
          </p>
        </Link>
      </div>
    </div>
  );
}