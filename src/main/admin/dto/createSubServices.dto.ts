import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateSubServicesDto {
  @ApiProperty({
    example: '6f7451fd-03b7-4dbf-b25a-d60efdbd7596',
    description: 'ID of the parent service',
  })
  @IsNotEmpty()
  @IsUUID()
  serviceId: string;

  @ApiProperty({ example: 'Sub-service Name', description: 'Name of the sub-service' })
  @IsNotEmpty()
  @IsString()
  name: string;
}
