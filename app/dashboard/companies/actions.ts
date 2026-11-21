"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  companyInputSchema,
  companyUpdateSchema,
} from "@/lib/validators/company";
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

function parseServices(input: string | null): string[] {
  if (!input) return [];
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function createCompanyAction(
  _prev: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAuth();
    const directoryId = Number(formData.get("directoryId"));
    if (isNaN(directoryId)) {
      return { success: false, error: "Invalid directoryId" };
    }
    const raw = {
      directoryId,
      name: formData.get("name")?.toString() ?? "",
      website: formData.get("website")?.toString() || null,
      type: formData.get("type")?.toString() ?? "",
      location: formData.get("location")?.toString() ?? "",
      area: formData.get("area")?.toString() ?? "",
      thana: formData.get("thana")?.toString() ?? "",
      district: formData.get("district")?.toString() ?? "",
      country: formData.get("country")?.toString() ?? "Bangladesh",
      services: parseServices(formData.get("services")?.toString() ?? null),
      email: formData.get("email")?.toString() || null,
      phone: formData.get("phone")?.toString() || null,
      verification_status:
        formData.get("verification_status")?.toString() ?? "",
      job_status: formData.get("job_status")?.toString() ?? "",
    };

    const parsed = companyInputSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid input",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const data = parsed.data;
    await prisma.company.create({
      data: {
        directoryId: data.directoryId,
        name: data.name,
        website: data.website || null,
        type: data.type,
        location: data.location,
        area: data.area,
        thana: data.thana,
        district: data.district,
        country: data.country,
        services: data.services ?? [],
        email: data.email || null,
        phone: data.phone || null,
        verification_status: data.verification_status,
        job_status: data.job_status,
      },
    });

    revalidatePath(`/dashboard/directories/${directoryId}`);
    redirect(`/dashboard/directories/${directoryId}`);
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    return { success: false, error: err instanceof Error ? err.message : "Error" };
  }
}

export async function updateCompanyAction(
  id: number,
  directoryId: number,
  _prev: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAuth();
    const raw = {
      name: formData.get("name")?.toString() || undefined,
      website: formData.get("website")?.toString() || null,
      type: formData.get("type")?.toString() || undefined,
      location: formData.get("location")?.toString() || undefined,
      area: formData.get("area")?.toString() || undefined,
      thana: formData.get("thana")?.toString() || undefined,
      district: formData.get("district")?.toString() || undefined,
      country: formData.get("country")?.toString() || undefined,
      services: parseServices(formData.get("services")?.toString() ?? null),
      email: formData.get("email")?.toString() || null,
      phone: formData.get("phone")?.toString() || null,
      verification_status:
        formData.get("verification_status")?.toString() || undefined,
      job_status: formData.get("job_status")?.toString() || undefined,
    };

    const parsed = companyUpdateSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid input",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const d = parsed.data;
    await prisma.company.update({
      where: { id },
      data: {
        ...(d.name !== undefined && { name: d.name }),
        ...(d.website !== undefined && { website: d.website || null }),
        ...(d.type !== undefined && { type: d.type }),
        ...(d.location !== undefined && { location: d.location }),
        ...(d.area !== undefined && { area: d.area }),
        ...(d.thana !== undefined && { thana: d.thana }),
        ...(d.district !== undefined && { district: d.district }),
        ...(d.country !== undefined && { country: d.country }),
        ...(d.services !== undefined && { services: d.services }),
        ...(d.email !== undefined && { email: d.email || null }),
        ...(d.phone !== undefined && { phone: d.phone || null }),
        ...(d.verification_status !== undefined && {
          verification_status: d.verification_status,
        }),
        ...(d.job_status !== undefined && { job_status: d.job_status }),
      },
    });

    revalidatePath(`/dashboard/directories/${directoryId}`);
    redirect(`/dashboard/directories/${directoryId}`);
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    return { success: false, error: err instanceof Error ? err.message : "Error" };
  }
}

export async function deleteCompanyAction(
  id: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const { role } = await requireAuth();
    if (role !== "admin") {
      return { success: false, error: "Forbidden: admin only" };
    }
    await prisma.company.delete({ where: { id } });
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Error" };
  }
}