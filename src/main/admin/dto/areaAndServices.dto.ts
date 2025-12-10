import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAreaDto {
  @ApiProperty({
    description: 'Name of the area',
    example: 'Dhaka',
  })
  @IsString()
  @IsNotEmpty()
  area: string;
}
export class CreateServicesDto {
  @ApiProperty({
    description: 'Name of the service',
    example: 'Plumbing',
  })
  @IsString()
  @IsNotEmpty()
  services?: string;
}
