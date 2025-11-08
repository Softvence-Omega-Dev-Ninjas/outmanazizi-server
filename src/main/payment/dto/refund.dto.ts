import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class RefundDto {
  @ApiProperty({ description: 'Charge ID to refund', example: 'ch_12345' })
  @IsString()
  @IsNotEmpty()
  chargeId: string;

  @ApiProperty({
    description: 'Amount in cents to refund (optional, full refund if omitted)',
    example: 500,
  })
  @IsOptional()
  @IsNumber()
  amountCents?: number;

  @ApiProperty({
    description: 'Order ID associated with the refund (optional)',
    example: 'order_12345',
  })
  @IsOptional()
  @IsString()
  orderId?: string; // optional to attach refund to order in DB
}
