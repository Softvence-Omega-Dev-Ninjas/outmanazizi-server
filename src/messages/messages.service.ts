import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WebsocketService {
  constructor(private readonly prisma: PrismaService) { }

  async saveMessage(
    currentUserId: string,
    payload: { to: string; text: string },

  ) {
    try {
      console.log(currentUserId);
      const currentUserIdExist = await this.prisma.messages.findFirst({
        where: { id: currentUserId },
      });
      if (!currentUserIdExist) {
        throw new NotFoundException('Current user not found');
      }
      // You can add your message saving logic here
      const message = await this.prisma.messages.create({
        data: {
          senderId: currentUserId,
          receiverId: payload.to,
          content: payload.text, // Use the correct field name from your Prisma schema
        },
      });
      return message;
    } catch (error) {
      console.log(error);
    }
  }

  async getMessagesForUser(currentUserId: string, user: string) { }

  async getAllMessages(userId: string) { }
}
