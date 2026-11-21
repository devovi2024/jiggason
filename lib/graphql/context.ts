import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Role } from "@/types";

export interface GraphQLContext {
  prisma: typeof prisma;
  userId: string | null;
  role: Role | null;
}

export async function createContext(): Promise<GraphQLContext> {
  const session = await auth();
  const role = (session?.user as { role?: Role })?.role ?? null;

  console.log("[GraphQL context]", {
    hasSession: !!session,
    userId: session?.user?.id,
    role,
  });

  return {
    prisma,
    userId: session?.user?.id ?? null,
    role,
  };
}