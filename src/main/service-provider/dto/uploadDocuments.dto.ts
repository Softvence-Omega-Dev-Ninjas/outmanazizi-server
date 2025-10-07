import { ApiProperty } from '@nestjs/swagger';

export class UploadDocumentsDto {
  @ApiProperty({
    description: 'document  field is (required)',
    type: 'array',
    items: { type: 'file', format: 'binary' },
    required: true,
  })
  documents: Express.Multer.File[];
}
