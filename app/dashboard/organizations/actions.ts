"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  organizationInputSchema,
  organizationUpdateSchema,
} from "@/lib/validators/organization";
import type { Role } from "@/types";

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
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

export async function createOrganizationAction(
  _prev: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAuth();

    const raw = {
      kind: formData.get("kind")?.toString() ?? "",
      name: formData.get("name")?.toString() ?? "",
      org: formData.get("org")?.toString() || null,
      website: formData.get("website")?.toString() || null,
      email: formData.get("email")?.toString() || null,
      phone: formData.get("phone")?.toString() || null,
    };

    const parsed = organizationInputSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid input",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<
          string,
          string[]
        >,
      };
    }

    await prisma.organization.create({
      data: {
        kind: parsed.data.kind,
        name: parsed.data.name,
        org: parsed.data.org || null,
        website: parsed.data.website || null,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
      },
    });

    revalidatePath("/dashboard/organizations");
    redirect("/dashboard/organizations");
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function updateOrganizationAction(
  id: number,
  _prev: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAuth();

    const raw = {
      kind: formData.get("kind")?.toString() || undefined,
      name: formData.get("name")?.toString() || undefined,
      org: formData.get("org")?.toString() || null,
      website: formData.get("website")?.toString() || null,
      email: formData.get("email")?.toString() || null,
      phone: formData.get("phone")?.toString() || null,
    };

    const parsed = organizationUpdateSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid input",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<
          string,
          string[]
        >,
      };
    }

    await prisma.organization.update({
      where: { id },
      data: {
        ...(parsed.data.kind && { kind: parsed.data.kind }),
        ...(parsed.data.name && { name: parsed.data.name }),
        ...(parsed.data.org !== undefined && { org: parsed.data.org || null }),
        ...(parsed.data.website !== undefined && {
          website: parsed.data.website || null,
        }),
        ...(parsed.data.email !== undefined && {
          email: parsed.data.email || null,
        }),
        ...(parsed.data.phone !== undefined && {
          phone: parsed.data.phone || null,
        }),
      },
    });

    revalidatePath("/dashboard/organizations");
    redirect("/dashboard/organizations");
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function deleteOrganizationAction(
  id: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const { role } = await requireAuth();
    if (role !== "admin") {
      return { success: false, error: "Forbidden: admin access required" };
    }

    await prisma.organization.delete({ where: { id } });
    revalidatePath("/dashboard/organizations");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}