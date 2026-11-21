import { GraphQLError } from "graphql";
import {
  organizationInputSchema,
  organizationUpdateSchema,
} from "@/lib/validators/organization";
import type { GraphQLContext } from "./context";

function requireAuth(ctx: GraphQLContext) {
  if (!ctx.userId) {
    throw new GraphQLError("Unauthorized: please log in", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
}

function requireAdmin(ctx: GraphQLContext) {
  requireAuth(ctx);
  if (ctx.role !== "admin") {
    throw new GraphQLError("Forbidden: admin access required", {
      extensions: { code: "FORBIDDEN" },
    });
  }
}

export const resolvers = {
  DateTime: {
    __serialize: (value: unknown) => {
      if (value instanceof Date) return value.toISOString();
      if (typeof value === "string" || typeof value === "number") {
        return new Date(value).toISOString();
      }
      return value;
    },
    __parseValue: (value: string) => new Date(value),
    __parseLiteral: (ast: { value: string }) => new Date(ast.value),
  },

  Query: {
    organizations: async (
      _: unknown,
      args: { kind?: string; search?: string },
      ctx: GraphQLContext
    ) => {
      requireAuth(ctx);
      return ctx.prisma.organization.findMany({
        where: {
          ...(args.kind ? { kind: args.kind } : {}),
          ...(args.search
            ? { name: { contains: args.search, mode: "insensitive" as const } }
            : {}),
        },
        orderBy: { createdAt: "desc" },
        take: 200,
      });
    },

    organization: async (
      _: unknown,
      args: { id: number },
      ctx: GraphQLContext
    ) => {
      requireAuth(ctx);
      return ctx.prisma.organization.findUnique({
        where: { id: args.id },
      });
    },
  },

  Mutation: {
    createOrganization: async (
      _: unknown,
      args: { input: unknown },
      ctx: GraphQLContext
    ) => {
      requireAuth(ctx);
      const parsed = organizationInputSchema.safeParse(args.input);
      if (!parsed.success) {
        throw new GraphQLError("Invalid input", {
          extensions: {
            code: "BAD_USER_INPUT",
            issues: parsed.error.flatten().fieldErrors,
          },
        });
      }
      return ctx.prisma.organization.create({
        data: {
          kind: parsed.data.kind,
          name: parsed.data.name,
          org: parsed.data.org || null,
          website: parsed.data.website || null,
          email: parsed.data.email || null,
          phone: parsed.data.phone || null,
        },
      });
    },

    updateOrganization: async (
      _: unknown,
      args: { id: number; input: unknown },
      ctx: GraphQLContext
    ) => {
      requireAuth(ctx);
      const parsed = organizationUpdateSchema.safeParse(args.input);
      if (!parsed.success) {
        throw new GraphQLError("Invalid input", {
          extensions: {
            code: "BAD_USER_INPUT",
            issues: parsed.error.flatten().fieldErrors,
          },
        });
      }
      return ctx.prisma.organization.update({
        where: { id: args.id },
        data: {
          ...(parsed.data.kind && { kind: parsed.data.kind }),
          ...(parsed.data.name && { name: parsed.data.name }),
          ...(parsed.data.org !== undefined && {
            org: parsed.data.org || null,
          }),
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
    },

    deleteOrganization: async (
      _: unknown,
      args: { id: number },
      ctx: GraphQLContext
    ) => {
      requireAdmin(ctx);
      await ctx.prisma.organization.delete({ where: { id: args.id } });
      return true;
    },
  },
};