import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class CreatePaymentIntentDto {
  @ApiProperty({ description: 'Order ID associated with the payment', example: 'order_12345' })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ description: 'Amount in cents to be charged', example: 1000 })
  @IsNumber()
  amountCents: number;

  @ApiProperty({ description: 'Currency for the payment', example: 'usd' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'Payment method ID', example: 'pm_12345' })
  @IsOptional()
  @IsString()
  paymentMethodId?: string;

  @ApiProperty({ description: 'Stripe Customer ID', example: 'cus_12345' })
  @IsOptional()
  @IsString()
  customerId?: string;

  // consumerId included only for internal/testing flows; prefer req.user in production
  @ApiProperty({ description: 'Consumer ID', example: 'user_12345' })
  @IsOptional()
  @IsString()
  consumerId?: string;
}

export class CreateTransferDto {
  @ApiProperty({ description: 'Order ID associated with the transfer', example: 'order_12345' })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ description: 'Amount in cents to be transferred', example: 1000 })
  @IsNumber()
  amountCents: number;

  @ApiProperty({ description: 'Destination Stripe Account ID', example: 'acct_12345' })
  @IsString()
  @IsNotEmpty()
  destinationAcctId: string; // acct_...

  @ApiProperty({ description: 'Currency for the transfer', example: 'usd' })
  @IsOptional()
  @IsString()
  currency?: string;
}

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
