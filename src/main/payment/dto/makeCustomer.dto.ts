import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class MakeCustomerDto {

  @ApiProperty({ description: 'Customer ID from Stripe', example: 'cus_12345' })
  @IsString()
  @IsNotEmpty()
  customerIdFromStripe: string;


  @ApiProperty({ description: "Customer payment method id", example: "pm_12345" })
  @IsString()
  @IsNotEmpty()
  paymentMethodIdFromStripe: string;
}