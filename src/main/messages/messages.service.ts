import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation-simple.dto';
import { SendMessageSimpleDto } from './dto/send-message-simple.dto';
import { GetMessagesSimpleDto } from './dto/get-messages-simple.dto';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  // ============ Conversation Management ============

  async getOrCreateConversation(userId: string, dto: CreateConversationDto) {
    const otherUser = await this.prisma.user.findUnique({
      where: { id: dto.otherUserId },
    });

    if (!otherUser) {
      throw new NotFoundException('User not found');
    }

    if (userId === dto.otherUserId) {
      throw new BadRequestException('Cannot create conversation with yourself');
    }

    // Ensure consistent ordering for unique constraint
    const [user1Id, user2Id] = [userId, dto.otherUserId].sort();

    // Check if conversation already exists
    let conversation = await this.prisma.conversation.findUnique({
      where: {
        user1Id_user2Id: { user1Id, user2Id },
      },
      include: {
        user1: {
          select: { id: true, name: true, email: true, picture: true },
        },
        user2: {
          select: { id: true, name: true, email: true, picture: true },
        },
      },
    });

    // Create conversation if it doesn't exist
    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: { user1Id, user2Id },
        include: {
          user1: {
            select: { id: true, name: true, email: true, picture: true },
          },
          user2: {
            select: { id: true, name: true, email: true, picture: true },
          },
        },
      });
    }

    return conversation;
  }

  async getConversations(userId: string) {
    try {
      const conversations = await this.prisma.conversation.findMany({
        where: {
          OR: [{ user1Id: userId }, { user2Id: userId }],
        },
        include: {
          user1: {
            select: { id: true, name: true, email: true, picture: true },
          },
          user2: {
            select: { id: true, name: true, email: true, picture: true },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              content: true,
              messageType: true,
              fileUrl: true,
              isRead: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              messages: {
                where: {
                  receiverId: userId,
                  isRead: false,
                },
              },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      // Transform to include the other user and unread count
      return conversations.map((conv) => ({
        id: conv.id,
        otherUser: conv.user1Id === userId ? conv.user2 : conv.user1,
        lastMessage: conv.messages[0] || null,
        unreadCount: conv._count.messages,
        updatedAt: conv.updatedAt,
        createdAt: conv.createdAt,
      }));
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  // ============ Message Management ============

  async sendMessage(userId: string, dto: SendMessageSimpleDto) {
    try {
      const receiver = await this.prisma.user.findUnique({
        where: { id: dto.receiverId },
      });

      if (!receiver) {
        throw new NotFoundException('Receiver not found');
      }

      // Get or create conversation
      const conversation = await this.getOrCreateConversation(userId, {
        otherUserId: dto.receiverId,
      });

      // Create message
      const message = await this.prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: userId,
          receiverId: dto.receiverId,
          content: dto.content,
          messageType: dto.messageType || 'TEXT',
          fileUrl: dto.fileUrl,
          fileName: dto.fileName,
          fileSize: dto.fileSize,
        },
        include: {
          sender: {
            select: { id: true, name: true, email: true, picture: true },
          },
          receiver: {
            select: { id: true, name: true, email: true, picture: true },
          },
        },
      });

      // Update conversation timestamp
      await this.prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      });

      return message;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to send message');
    }
  }

  async getMessages(userId: string, dto: GetMessagesSimpleDto) {
    try {
      // Get or create conversation
      const conversation = await this.getOrCreateConversation(userId, {
        otherUserId: dto.otherUserId,
      });

      const skip = ((dto.page || 1) - 1) * (dto.limit || 50);
      const take = dto.limit || 50;

      const where: {
        conversationId: string;
        isDeleted: boolean;
        createdAt?: { lt: Date };
      } = {
        conversationId: conversation.id,
        isDeleted: false,
      };

      // Cursor-based pagination
      if (dto.beforeMessageId) {
        const beforeMessage = await this.prisma.message.findUnique({
          where: { id: dto.beforeMessageId },
        });
        if (beforeMessage) {
          where.createdAt = { lt: beforeMessage.createdAt };
        }
      }

      const [messages, total] = await Promise.all([
        this.prisma.message.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: { id: true, name: true, email: true, picture: true },
            },
            receiver: {
              select: { id: true, name: true, email: true, picture: true },
            },
          },
        }),
        this.prisma.message.count({ where }),
      ]);

      return {
        messages: messages.reverse(), // Reverse to get chronological order
        total,
        page: dto.page || 1,
        limit: dto.limit || 50,
        hasMore: skip + messages.length < total,
        conversationId: conversation.id,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to retrieve messages');
    }
  }
}
