import { GraphQLError } from "graphql";
import {
  organizationInputSchema,
  organizationUpdateSchema,
} from "@/lib/validators/organization";
import {
  directoryInputSchema,
  directoryUpdateSchema,
} from "@/lib/validators/directory";
import {
  companyInputSchema,
  companyUpdateSchema,
} from "@/lib/validators/company";
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

function zodError(err: { flatten: () => { fieldErrors: unknown } }) {
  return new GraphQLError("Invalid input", {
    extensions: { code: "BAD_USER_INPUT", issues: err.flatten().fieldErrors },
  });
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
    // ── ORGANIZATION ──
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
    organization: async (_: unknown, args: { id: number }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.organization.findUnique({ where: { id: args.id } });
    },

    // ── DIRECTORY ──
    directories: async (
      _: unknown,
      args: { search?: string },
      ctx: GraphQLContext
    ) => {
      requireAuth(ctx);
      return ctx.prisma.directory.findMany({
        where: args.search
          ? {
              OR: [
                { area: { contains: args.search, mode: "insensitive" as const } },
                { district: { contains: args.search, mode: "insensitive" as const } },
                { thana: { contains: args.search, mode: "insensitive" as const } },
              ],
            }
          : {},
        orderBy: { id: "desc" },
        take: 200,
      });
    },
    directory: async (_: unknown, args: { id: number }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.directory.findUnique({ where: { id: args.id } });
    },

    // ── COMPANY ──
    companies: async (
      _: unknown,
      args: { directoryId?: number; search?: string },
      ctx: GraphQLContext
    ) => {
      requireAuth(ctx);
      return ctx.prisma.company.findMany({
        where: {
          ...(args.directoryId ? { directoryId: args.directoryId } : {}),
          ...(args.search
            ? { name: { contains: args.search, mode: "insensitive" as const } }
            : {}),
        },
        orderBy: { createdAt: "desc" },
        take: 500,
      });
    },
    company: async (_: unknown, args: { id: number }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.prisma.company.findUnique({ where: { id: args.id } });
    },
  },

  Directory: {
    companies: async (parent: { id: number }, _: unknown, ctx: GraphQLContext) => {
      return ctx.prisma.company.findMany({
        where: { directoryId: parent.id },
        orderBy: { createdAt: "desc" },
      });
    },
  },

  Company: {
    directory: async (parent: { directoryId: number }, _: unknown, ctx: GraphQLContext) => {
      return ctx.prisma.directory.findUnique({
        where: { id: parent.directoryId },
      });
    },
  },

  Mutation: {
    // ── ORGANIZATION ──
    createOrganization: async (
      _: unknown,
      args: { input: unknown },
      ctx: GraphQLContext
    ) => {
      requireAuth(ctx);
      const parsed = organizationInputSchema.safeParse(args.input);
      if (!parsed.success) throw zodError(parsed.error);
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
      if (!parsed.success) throw zodError(parsed.error);
      return ctx.prisma.organization.update({
        where: { id: args.id },
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

    // ── DIRECTORY ──
    createDirectory: async (
      _: unknown,
      args: { input: unknown },
      ctx: GraphQLContext
    ) => {
      requireAuth(ctx);
      const parsed = directoryInputSchema.safeParse(args.input);
      if (!parsed.success) throw zodError(parsed.error);
      return ctx.prisma.directory.create({ data: parsed.data });
    },
    updateDirectory: async (
      _: unknown,
      args: { id: number; input: unknown },
      ctx: GraphQLContext
    ) => {
      requireAuth(ctx);
      const parsed = directoryUpdateSchema.safeParse(args.input);
      if (!parsed.success) throw zodError(parsed.error);
      return ctx.prisma.directory.update({
        where: { id: args.id },
        data: parsed.data,
      });
    },
    deleteDirectory: async (
      _: unknown,
      args: { id: number },
      ctx: GraphQLContext
    ) => {
      requireAdmin(ctx);
      await ctx.prisma.directory.delete({ where: { id: args.id } });
      return true;
    },

    // ── COMPANY ──
    createCompany: async (
      _: unknown,
      args: { input: unknown },
      ctx: GraphQLContext
    ) => {
      requireAuth(ctx);
      const parsed = companyInputSchema.safeParse(args.input);
      if (!parsed.success) throw zodError(parsed.error);
      const data = parsed.data;
      return ctx.prisma.company.create({
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
    },
    updateCompany: async (
      _: unknown,
      args: { id: number; input: unknown },
      ctx: GraphQLContext
    ) => {
      requireAuth(ctx);
      const parsed = companyUpdateSchema.safeParse(args.input);
      if (!parsed.success) throw zodError(parsed.error);
      const d = parsed.data;
      return ctx.prisma.company.update({
        where: { id: args.id },
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
    },
    deleteCompany: async (
      _: unknown,
      args: { id: number },
      ctx: GraphQLContext
    ) => {
      requireAdmin(ctx);
      await ctx.prisma.company.delete({ where: { id: args.id } });
      return true;
    },
  },
};