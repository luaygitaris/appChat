import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// DELETE handler
export async function DELETE(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const conversationId = params.conversationId;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        participants: true,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { message: "Conversation not found" },
        { status: 404 }
      );
    }

    if (conversation.isGroup) {
      const isAdmin = await prisma.conversationParticipant.findFirst({
        where: {
          conversationId,
          userId: session.user.id,
          isAdmin: true,
        },
      });

      if (!isAdmin) {
        return NextResponse.json(
          { message: "Only group admins can delete this conversation" },
          { status: 403 }
        );
      }
    }

    await prisma.message.deleteMany({
      where: {
        conversationId,
      },
    });

    await prisma.conversationParticipant.deleteMany({
      where: {
        conversationId,
      },
    });

    await prisma.conversation.delete({
      where: {
        id: conversationId,
      },
    });

    return NextResponse.json(
      { message: "Conversation deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET handler
export async function GET(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const { conversationId } = await params;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    // Debugging: log the conversation and participants
    // console.log("Conversation fetched:", conversation);

    if (!conversation) {
      return NextResponse.json(
        { message: "Conversation not found" },
        { status: 404 }
      );
    }

    // Create a list of participant names (including admins)
    const participantNames = conversation.participants.map((participant) => participant.user.name);

    // Debugging: log the participant names
    // console.log("Participant names:", participantNames);

    // Add participant names to the response
    const conversationWithParticipants = {
      ...conversation,
      participantsNames: participantNames,  // Add this field with the list of names
    };

    return NextResponse.json(conversationWithParticipants);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}


