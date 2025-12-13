import { ApiProperty } from "@nestjs/swagger";

export class AppleLoginDto {
  @ApiProperty({ example: 'apple-user-id-123', description: 'The unique identifier for the Apple user' })
  appleUserId: string;
}