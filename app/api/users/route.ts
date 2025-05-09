import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (email) {
      const user = await prisma.user.findMany({
        where: {
          email: {
            contains: email,
            mode: "insensitive", // optional: case-insensitive
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      return NextResponse.json(user);
    }

    // Default: return all users (optional - you may skip this if not needed)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("[GET /api/users] Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
