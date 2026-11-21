"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  directoryInputSchema,
  directoryUpdateSchema,
} from "@/lib/validators/directory";
import type { Role } from "@/types";

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return {
    userId: session.user.id,
    role: ((session.user as { role?: Role }).role ?? "editor") as Role,
  };
}

export type ActionState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createDirectoryAction(
  _prev: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAuth();
    const raw = {
      area: formData.get("area")?.toString() ?? "",
      district: formData.get("district")?.toString() ?? "",
      country: formData.get("country")?.toString() ?? "",
      thana: formData.get("thana")?.toString() ?? "",
    };
    const parsed = directoryInputSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid input",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }
    await prisma.directory.create({ data: parsed.data });
    revalidatePath("/dashboard/directories");
    redirect("/dashboard/directories");
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    return { success: false, error: err instanceof Error ? err.message : "Error" };
  }
}

export async function updateDirectoryAction(
  id: number,
  _prev: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAuth();
    const raw = {
      area: formData.get("area")?.toString() || undefined,
      district: formData.get("district")?.toString() || undefined,
      country: formData.get("country")?.toString() || undefined,
      thana: formData.get("thana")?.toString() || undefined,
    };
    const parsed = directoryUpdateSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid input",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }
    await prisma.directory.update({ where: { id }, data: parsed.data });
    revalidatePath("/dashboard/directories");
    redirect(`/dashboard/directories/${id}`);
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    return { success: false, error: err instanceof Error ? err.message : "Error" };
  }
}

export async function deleteDirectoryAction(
  id: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const { role } = await requireAuth();
    if (role !== "admin") return { success: false, error: "Forbidden: admin only" };
    await prisma.directory.delete({ where: { id } });
    revalidatePath("/dashboard/directories");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Error" };
  }
}