import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const users = await prisma.user.count();
  const blogs = await prisma.blog.count();
  return NextResponse.json({
    status: "ok",
    users,
    blogs,
    time: new Date().toISOString(),
  });
}