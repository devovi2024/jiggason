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
          <p className="text-sm text-gray-600">Role: {role}</p>
        </div>
        <LogoutButton />
      </div>
    </div>
  );
}