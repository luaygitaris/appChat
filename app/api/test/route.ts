import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // pastikan path ini sesuai strukturmu

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true, // tambah jika perlu
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("[GET /api/test-users] Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
