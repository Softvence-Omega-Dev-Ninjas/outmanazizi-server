import { ApiProperty } from "@nestjs/swagger";

export class CreateDisputeDto {


  @ApiProperty({
    example: 'bid_1234567890',
    description: "Product bid ID associated with the dispute"
  })
  bidId: string;

  @ApiProperty({
    example: 'The product was not as described',
    description: "Reason for the dispute"
  })
  reason: string;

}
