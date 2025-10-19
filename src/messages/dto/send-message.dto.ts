import { IsString, IsOptional, IsEnum, IsBoolean, IsArray } from 'class-validator';

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  PDF = 'PDF',
  DOCUMENT = 'DOCUMENT',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
  AI_RESPONSE = 'AI_RESPONSE',
  SYSTEM = 'SYSTEM',
}

export class SendMessageDto {
  @IsString()
  conversationId: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(MessageType)
  messageType?: MessageType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[]; // File URLs or paths

  @IsOptional()
  metadata?: any; // For AI context, file info, etc.

  @IsOptional()
  @IsBoolean()
  isAIGenerated?: boolean;

  @IsOptional()
  @IsString()
  replyToId?: string;
}
