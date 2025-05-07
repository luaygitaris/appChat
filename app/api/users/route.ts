import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // pastikan path benar

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("[GET /api/users] Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
