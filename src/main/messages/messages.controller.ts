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
import { GetMessagesSimpleDto } from './dto/get-messages-simple.dto';
import { ApiResponse } from 'src/utils/common/apiresponse/apiresponse';
import type { Request } from 'express';
import { storageConfig } from 'src/utils/common/file/fileUploads';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { AuthenticationGuard } from 'src/guards/auth.guard';
import { UploadImageDto } from '../auth/dto/uploadImage.dto';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Public } from 'src/guards/public.decorator';

@Controller('chat')
@UseGuards(AuthenticationGuard)
export class ChatController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly gateway: MessagesGateway,
  ) {}

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

  @Post('messages')
  async getMessages(@Req() req: Request, @Body() query: GetMessagesSimpleDto) {
    const result = await this.messagesService.getMessages(req['userid'] as string, query);
    return ApiResponse.success(result, 'Messages retrieved');
  }

  @Post('upload')
  @Public()
  @ApiBody({ type: UploadImageDto })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('images', {
      storage: storageConfig('./public/uploads/chat'),
    }),
  )
  uploadFile(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
    // @Body() dto: UploadImageDto,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    const fileUrl = `${process.env.DOMAIN}/uploads/chat/${file.filename}`;
    return ApiResponse.success(fileUrl, 'File sent successfully');
  }

  // ============ Utility ============
}
