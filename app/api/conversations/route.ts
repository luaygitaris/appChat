import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const conversationSchema = z.object({
  name: z.string().optional().nullable(),
  isGroup: z.boolean().default(false),
  userIds: z
    .array(z.string())
    .min(1, { message: "Please select at least one user" }),
  isAdmin: z.boolean().default(false),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      console.error("Unauthorized request: No session found");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("Received body:", body); // Log the received data

    const validation = conversationSchema.safeParse(body);

    if (!validation.success) {
      console.error("Validation failed:", validation.error.errors); // Log validation errors
      return NextResponse.json(
        { message: "Invalid input", errors: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, isGroup, userIds } = validation.data;

    // Check for existing conversation if not a group
    if (!isGroup && userIds.length === 0) {
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          AND: [
            { isGroup: false },
            {
              participants: {
                some: {
                  userId: session.user.id,
                },
              },
            },
            {
              participants: {
                some: {
                  userId: userIds[0],
                },
              },
            },
          ],
        },
        include: {
          participants: {
            include: {
              user: true,
            },
          },
        },
      });

      if (existingConversation) {
        console.log("Existing conversation found:", existingConversation);
        return NextResponse.json(existingConversation, { status: 200 });
      }
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        name: isGroup ? name : null,
        isGroup,
        participants: {
          create: [
            {
              userId: session.user.id,
              isAdmin: true, // The creator of the group is an admin
            },
            ...userIds.map((userId) => ({
              userId,
              isAdmin: false,
            })),
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    console.log("Created conversation:", conversation);
    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error("Error creating conversation:", error); // Log the error
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("❌ Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
