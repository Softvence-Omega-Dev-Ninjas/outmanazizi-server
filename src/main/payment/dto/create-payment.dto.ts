import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, IsPositive } from 'class-validator';

export class CreatePaymentIntentDto {
  @ApiProperty({ description: 'Bid ID associated with the payment', example: 'bid_12345' })
  @IsString()
  @IsNotEmpty()
  bidId: string;

  @ApiProperty({ description: 'Amount in cents to be charged', example: 1000 })
  @IsNumber()
  @IsPositive()
  amount: number;


}

export class CreateTransferDto {
  @ApiProperty({ description: 'Bid ID associated with the payment', example: 'bid_12345' })
  @IsString()
  @IsNotEmpty()
  orderId: string;


  @ApiProperty({ description: 'Amount in cents to be transferred', example: 1000 })
  @IsNumber()
  amountCents: number;


}




