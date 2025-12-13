import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";
import { UserRole } from "src/utils/common/enum/userEnum";

export class GoogleAuthDto {
  @ApiProperty({ example: 'Name of User', description: 'The unique identifier for the Google user' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'user@example.com', description: 'The email address of the Google user' })
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: 'https://example.com/user.jpg', description: 'The profile picture URL of the Google user' })
  @IsOptional()
  picture?: string;

  @ApiProperty({ example: UserRole.CONSUMER, description: 'The role of the user' })
  @IsNotEmpty()
  role: UserRole;

  @ApiProperty({ example: 'apple-push-token-123', description: 'The Apple Push token of the user' })
  @IsNotEmpty()
  applePushToken: string;
}