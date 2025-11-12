import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class RefundDto {
  @ApiProperty({
    description: 'Amount in cents to refund (optional, full refund if omitted)',
    example: 500,
  })
  @IsOptional()
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Payment Intent ID to refund',
    example: 'pi_1J2Yz2B9TuUJhvf8XxYz2AbC',
  })
  @IsString()
  @IsNotEmpty()
  paymentIntentId: string;

}
