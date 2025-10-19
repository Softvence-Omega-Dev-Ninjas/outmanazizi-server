import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateConversationDto } from './dto/create-conversation-simple.dto';
import { SendMessageSimpleDto } from './dto/send-message-simple.dto';
import { GetMessagesSimpleDto } from './dto/get-messages-simple.dto';
import { UploadFileSimpleDto, FileType } from './dto/upload-file-simple.dto';
import { ApiResponse } from 'src/utils/common/apiresponse/apiresponse';
import type { Request } from 'express';
import { storageConfig } from 'src/utils/common/file/fileUploads';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { AuthenticationGuard } from 'src/guards/auth.guard';




@Controller('chat')
@UseGuards(AuthenticationGuard)
export class ChatController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly gateway: MessagesGateway,
  ) { }

  @Post('conversations')
  async createConversation(@Req() req: Request, @Body() dto: CreateConversationDto) {
    const conversation = await this.messagesService.getOrCreateConversation(
      req['userid'] as string,
      dto,
    );
    return ApiResponse.success(conversation, 'Conversation ready');
  }

  @Get('conversations')
  async getConversations(@Req() req: Request) {
    const conversations = await this.messagesService.getConversations(req['userid'] as string);
    return ApiResponse.success(conversations, 'Conversations retrieved');
  }


  @Post('messages/send')
  async sendMessage(@Req() req: Request, @Body() dto: SendMessageSimpleDto) {
    const message = await this.messagesService.sendMessage(req['userid'] as string, dto);
    this.gateway.sendMessageToUser(dto.receiverId, message);

    return ApiResponse.success(message, 'Message sent');
  }

  @Post('messages')
  async getMessages(@Req() req: Request, @Body() query: GetMessagesSimpleDto) {
    console.log(query);
    const result = await this.messagesService.getMessages(req['userid'] as string, query);
    return ApiResponse.success(result, 'Messages retrieved');
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: storageConfig('./public/uploads/chat'),
    }),
  )
  async uploadFile(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadFileSimpleDto,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');

    const fileUrl = `${process.env.DOMAIN}/uploads/chat/${file.filename}`;
    const messageType = dto.fileType === FileType.IMAGE ? 'IMAGE' : 'PDF';

    const message = await this.messagesService.sendMessage(req['userid'] as string, {
      receiverId: dto.receiverId,
      content: dto.caption || file.originalname,
      messageType: messageType as any,
      fileUrl,
      fileName: file.originalname,
      fileSize: file.size,
    });

    // Emit via WebSocket
    this.gateway.sendMessageToUser(dto.receiverId, message);

    return ApiResponse.success(message, 'File sent successfully');
  }

  // ============ Utility ============


}
