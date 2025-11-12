import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsNotEmpty, IsPositive } from 'class-validator';

export class CreatePaymentIntentDto {
  @ApiProperty({ description: 'Order ID associated with the payment', example: 'order_12345' })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ description: 'Amount in cents to be charged', example: 1000 })
  @IsNumber()
  @IsPositive()
  amount: number;
}

export class CreateTransferDto {
  @ApiProperty({ description: 'Amount in cents to be transferred', example: 1000 })
  @IsNumber()
  amountCents: number;

  @ApiProperty({ description: 'Destination Stripe Account ID', example: 'acct_12345' })
  @IsString()
  @IsNotEmpty()
  destinationAcctId: string;

  @ApiProperty({ description: 'Currency for the transfer', example: 'usd' })
  @IsOptional()
  @IsString()
  currency?: string;
}




