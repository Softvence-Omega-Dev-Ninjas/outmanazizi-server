import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsUUID, IsNotEmpty } from 'class-validator';
import { UploadImageDto } from 'src/main/auth/dto/uploadImage.dto';

export class CreateDisputeDto extends PartialType(UploadImageDto) {
  @ApiProperty({
    description: 'The ID of the bid associated with the dispute',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  bidId: string;


  @ApiProperty({
    description: 'The ID of the user associated with the dispute',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  againstDisputId: string;


  @ApiProperty({
    description: 'Details of the dispute',
    example: 'The product was not delivered as promised.',
  })
  @IsNotEmpty()
  @IsString()
  details: string;

}
