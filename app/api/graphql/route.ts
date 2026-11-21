import { createYoga, createSchema } from "graphql-yoga";
import { typeDefs } from "@/lib/graphql/schema";
import { resolvers } from "@/lib/graphql/resolvers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Role } from "@/types";
import type { NextRequest } from "next/server";

function createYogaInstance() {
  return createYoga({
    schema: createSchema({ typeDefs, resolvers }),
    context: async () => {
      const session = await auth();
      return {
        prisma,
        userId: session?.user?.id ?? null,
        role: ((session?.user as { role?: Role })?.role ?? null) as Role | null,
      };
    },
    graphqlEndpoint: "/api/graphql",
    graphiql: process.env.NODE_ENV === "development",
  });
}

export async function GET(req: NextRequest) {
  const yoga = createYogaInstance();
  return yoga.handleRequest(req, {});
}

export async function POST(req: NextRequest) {
  const yoga = createYogaInstance();
  return yoga.handleRequest(req, {});
}