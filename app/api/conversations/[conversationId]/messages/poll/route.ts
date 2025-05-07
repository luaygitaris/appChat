import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request, { params }: { params: { conversationId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const conversationId = await params.conversationId
    const { searchParams } = new URL(req.url)
    const lastMessageId = searchParams.get("lastMessageId")

    // Check if user is part of the conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            userId: session.user.id,
          },
        },
      },
    })

    if (!conversation) {
      return NextResponse.json({ message: "Conversation not found" }, { status: 404 })
    }

    // If no lastMessageId is provided, return empty array
    if (!lastMessageId) {
      return NextResponse.json([], { status: 200 })
    }

    // Get the last message to find its timestamp
    const lastMessage = await prisma.message.findUnique({
      where: {
        id: lastMessageId,
      },
    })

    if (!lastMessage) {
      return NextResponse.json([], { status: 200 })
    }

    // Get new messages after the last message
    const newMessages = await prisma.message.findMany({
      where: {
        conversationId,
        createdAt: {
          gt: lastMessage.createdAt,
        },
        NOT: {
          id: lastMessageId,
        },
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    return NextResponse.json(newMessages, { status: 200 })
  } catch (error) {
    console.error("Error polling messages:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
