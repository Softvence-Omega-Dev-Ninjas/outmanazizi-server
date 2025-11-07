// // ...existing code...
// import { Injectable, Inject, forwardRef, Logger } from '@nestjs/common';
// import { PrismaService } from 'src/prisma/prisma.service';
// import { MessagesGateway } from 'src/main/messages/messages.gateway';

// @Injectable()
// export class NotificationsService {
//   private readonly logger = new Logger(NotificationsService.name);
//   constructor(
//     private readonly prisma: PrismaService,
//     @Inject(forwardRef(() => MessagesGateway))
//     private readonly messagesGateway: MessagesGateway,
//   ) { }

//   async create(userId: string, title: string, body: string, data?: any) {
//     const notification = await this.prisma.notification.create({
//       data: { userId, title, body, data },
//     });
//     try {
//       this.messagesGateway.sendNotificationToUser(userId, notification);
//     } catch (e) {
//       this.logger.warn('Failed to emit socket notification', e);
//     }
//     return notification;
//   }

//   // helper for job events
//   async notifyJobEvent(userId: string, event: 'job_done' | 'job_rejected' | 'dispute_resolved' | 'payment_released', payload: any) {
//     const map = {
//       job_done: { title: 'Job completed', body: 'Please confirm/approve the job', data: payload },
//       job_rejected: { title: 'Job rejected', body: 'A job was rejected — action required', data: payload },
//       dispute_resolved: { title: 'Dispute resolved', body: 'A dispute was resolved', data: payload },
//       payment_released: { title: 'Payment released', body: 'Payment has been released', data: payload },
//     };
//     const { title, body, data } = map[event];
//     return this.create(userId, title, body, data);
//   }
// }
