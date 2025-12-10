import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class RefundDto {
  @ApiProperty({
    description: ' Order ID associated with the refund',
    example: 'order_12345',
  })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({
    description: 'Amount to refund',
    example: '500',
  })
  @IsString()
  @IsNotEmpty()
  amount: string;

}
