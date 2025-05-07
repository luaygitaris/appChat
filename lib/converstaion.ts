// /lib/conversation.ts

import {prisma} from "@/lib/prisma";

export async function getConversationById(conversationId: string) {
  return prisma.conversation.findUnique({
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
}
