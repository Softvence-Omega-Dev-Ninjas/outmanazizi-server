import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class AppleLoginDto {
  @ApiProperty({ example: 'user@example.com', description: 'The email address of the Apple user' })
  @IsNotEmpty()
  email: string;


  @ApiProperty({ example: 'select your role ', description: 'role ' })
  @IsNotEmpty()
  role: string;

}