import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class AppleLoginDto {
  @ApiProperty({ example: 'apple-user-id-123', description: 'The unique identifier for the Apple user' })
  @IsNotEmpty()
  appleUserId: string;


  @ApiProperty({ example: 'select your role ', description: 'role ' })
  @IsNotEmpty()
  role: string;

}