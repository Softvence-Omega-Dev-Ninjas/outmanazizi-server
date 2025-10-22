import { IsString, IsEnum, IsOptional } from 'class-validator';

export enum FileType {
  IMAGE = 'IMAGE',
  PDF = 'PDF',
}

export class UploadFileSimpleDto {
  @IsString()
  receiverId: string;

  @IsEnum(FileType)
  fileType: FileType;

  @IsOptional()
  @IsString()
  caption?: string;
}
