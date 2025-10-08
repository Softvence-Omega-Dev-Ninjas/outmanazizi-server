import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { WebsocketService } from './messages.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
@Injectable()
export class SmsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private logger = new Logger('SmsGateway');

  constructor(
    @Inject(forwardRef(() => WebsocketService))
    private readonly chatService: WebsocketService,
  ) {}

  handleConnection(client: Socket) {
    const user = client.handshake.query.user;
    const username = Array.isArray(user) ? user[0] : user;
    if (username) {
      client.join(username);
      this.logger.log(`Client ${client.id} joined room ${username}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  sendMessageToUser(toUserId: string, message: any) {
    if (!this.server) return;
    this.server.to(toUserId).emit('receive_message', message);
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody()
    data: {
      senderId: string;
      toUserId: string;
      content: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    // Validate payload
    if (!data.senderId || !data.toUserId || !data.content) {
      client.emit('error', { message: 'Invalid message payload' });
      return;
    }

    try {
      // Save message in the database
      const savedMessage = await this.chatService.saveMessage(data.senderId, {
        to: data.toUserId,
        text: data.content,
      });
      console.log('Message saved:', savedMessage);
      // Emit message to the receiver
      this.server.to(data.toUserId).emit('receive_message', savedMessage);
      // Emit back to sender for confirmation
      client.emit('receive_message', savedMessage);
    } catch (error) {
      console.error('Error saving message:', error);
      client.emit('error', { message: 'Failed to save message' });
    }
  }
}
