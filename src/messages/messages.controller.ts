import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { WebsocketService } from './messages.service';
import { SmsGateway } from './messages.gateway';
import { JwtAuthGuard } from 'src/main/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/role.guard';

@Controller('sms')
export class SmsController {
  constructor(
    private readonly wsService: WebsocketService,
    private readonly gateway: SmsGateway,
  ) {}

  // Send message via HTTP → emits to WebSocket
  @Post('send')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  async sendMessage(
    @Body() body: { senderId: string; toUserId: string; content: string },
  ) {
    const { senderId, toUserId, content } = body;

    // Save message
    const saved = await this.wsService.saveMessage(senderId, {
      to: toUserId,
      text: content,
    });

    // Emit message via WebSocket
    this.gateway.sendMessageToUser(toUserId, saved);

    return { success: true, message: 'Message sent', data: saved };
  }

  // List conversation messages
  // @Get('list')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // async listMessages(
  //   @Query('user') user: string,
  //   // @Request() req: { user: AuthUser },
  // ) {
  //   return await this.wsService.getMessagesForUser(req.user.userId, user);
  // }

  // List all messages for current user
  // @Get('all-users')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // async getAllMessages(@Request() req: { user: AuthUser }) {
  //   return await this.wsService.getAllMessages(req.user.userId);
  // }
}
