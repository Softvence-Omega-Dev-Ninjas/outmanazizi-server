import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateStripeDto {
  @ApiProperty({
    description: 'User ID associated with the Stripe account',
    example: 'd99d8d4a-5960-4878-8c0d-5719944f69e8',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Country code for the Stripe account',
    example: 'US',
    required: false,
  })
  @IsOptional()
  @IsString()
  country?: string;
}


export class CreateAccountLinkDto {
  @ApiProperty({
    description: 'Stripe Account ID',
    example: 'acct_1JHh2BCMdEe9UeUS',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  stripeAccountId: string;

  @ApiProperty({
    description: 'Return URL after account link completion',
    example: 'https://yourapp.com/return',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  returnUrl: string;

  @ApiProperty({
    description: 'Refresh URL if the account link needs to be retried',
    example: 'https://yourapp.com/refresh',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  refreshUrl: string;
}

export class CreateLoginLinkDto {
  @ApiProperty({
    description: 'Stripe Account ID',
    example: 'acct_1SKSUVC3Qydfs8uy',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  stripeAccountId: string;
}