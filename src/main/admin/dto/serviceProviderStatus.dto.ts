import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator'; 
import { ServiceProviderStatus } from 'src/main/auth/role.enum';



export class ChangeServiceStatusDto {
 
  @ApiProperty({
    description: 'New status of the user',
    enum: ServiceProviderStatus,
    example: ServiceProviderStatus.APPROVED,
  })
  @IsEnum(ServiceProviderStatus)
  status: ServiceProviderStatus;

  @ApiPropertyOptional({
    description: 'Optional message or reason for status change',
    example: 'User violated platform policy',
  })
  @IsOptional()
  @IsString()
  message?: string;
}
