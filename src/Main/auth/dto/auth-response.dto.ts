import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: 'ckd2hs2r20000q8vz9v8v9v8v',
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    required: false,
  })
  firstName?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: false,
  })
  lastName?: string;

  @ApiProperty({
    description: 'User account status',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Account creation date',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'User information',
    type: UserResponseDto,
  })
  user: UserResponseDto;
}
