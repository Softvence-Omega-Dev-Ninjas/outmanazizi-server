import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFiles, Req, BadRequestException } from '@nestjs/common';
import { DisputeService } from './dispute.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { UpdateDisputeDto } from './dto/update-dispute.dto';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/guards/auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { storageConfig } from 'src/utils/common/file/fileUploads';

@Controller('dispute')
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) { }

  @Post()
  @ApiOperation({ summary: 'Upload  dispute data' })
  @UseGuards(AuthenticationGuard)
  @ApiBody({ type: CreateDisputeDto })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 10, { storage: storageConfig() }))
  async create(@Body() createDisputeDto: CreateDisputeDto, @UploadedFiles() images: Express.Multer.File[], @Req() req: Request) {
    const domain = process.env.DOMAIN;
    if (!domain) {
      throw new BadRequestException('DOMAIN must be defined in environment variables');
    }
    const image = images.map((f) => `${domain}/uploads/${f.filename}`);
    return await this.disputeService.create(createDisputeDto, req['userid'] as string, image);
  }

  @Get()
  async findAll() {
    return await this.disputeService.findAll();
  }

  // get dispute by specific user id
  @Get('current-user')
  @ApiOperation({ summary: 'Get disputes for the current authenticated user' })
  @UseGuards(AuthenticationGuard)
  find(@Req() req: Request) {
    return this.disputeService.findDisputeByUser(req['userid'] as string);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDisputeDto: UpdateDisputeDto) {
    return this.disputeService.update(+id, updateDisputeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.disputeService.remove(+id);
  }
}
