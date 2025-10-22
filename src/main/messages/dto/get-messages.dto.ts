import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum MessageFilter {
  ALL = 'ALL',
  UNREAD = 'UNREAD',
  AI_ONLY = 'AI_ONLY',
  USER_ONLY = 'USER_ONLY',
}

export class GetMessagesDto {
  @IsString()
  conversationId: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 50;

  @IsOptional()
  @IsEnum(MessageFilter)
  filter?: MessageFilter = MessageFilter.ALL;

  @IsOptional()
  @IsString()
  beforeTimestamp?: string; // For pagination
}
