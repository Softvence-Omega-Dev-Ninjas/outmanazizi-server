import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,

} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
@Injectable()
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private logger = new Logger('MessagesGateway');

  // Map to track connected users
  private connectedUsers = new Map<string, string>(); // userId -> socketId

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId;
    const userIdStr = Array.isArray(userId) ? userId[0] : userId;

    if (userIdStr) {
      this.connectedUsers.set(userIdStr, client.id);
      void client.join(`user:${userIdStr}`);
      this.logger.log(`User ${userIdStr} connected with socket ${client.id}`);

      // Notify user is online
      client.broadcast.emit('user_online', { userId: userIdStr });
    }
  }

  handleDisconnect(client: Socket) {
    // Find and remove user from connected users map
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        this.logger.log(`User ${userId} disconnected`);
        client.broadcast.emit('user_offline', { userId });
        break;
      }
    }
  }

  // Send message to specific user
  sendMessageToUser(userId: string, message: any) {
    if (!this.server) return;

    this.server.to(`user:${userId}`).emit('new_message', message);
    this.logger.log(`Sent message to user ${userId}`);
  }

  // Send message update (edit)
  sendMessageUpdate(userId: string, message: any) {
    if (!this.server) return;

    this.server.to(`user:${userId}`).emit('message_updated', message);
    this.logger.log(`Sent message update to user ${userId}`);
  }

  // Send message delete notification
  sendMessageDelete(userId: string, messageId: string) {
    if (!this.server) return;

    this.server.to(`user:${userId}`).emit('message_deleted', { messageId });
    this.logger.log(`Sent message deletion to user ${userId}`);
  }






  // Get online status
  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  getOnlineUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }
}
