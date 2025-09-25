import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { AuthenticationGuard } from 'src/guards/auth.guard';
import type { Request } from 'express';
import { ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { storageConfig } from 'src/utils/common/file/fileUploads';

@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  // Create a new job
  @Post('create-job')
  @UseGuards(AuthenticationGuard)
  @ApiOperation({ summary: 'Create a new job' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 10, { storage: storageConfig() }))
  async create(
    @Body() createJobDto: CreateJobDto,
    @Req() req: Request,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    const imageUrls = images.map(
      (f) => `${process.env.DOMAIN}/uploads/${f.filename}`,
    );

    createJobDto.images = imageUrls;
    return await this.jobService.create(req['userid'] as string, createJobDto);
  }

  @Get()
  @UseGuards(AuthenticationGuard)
  async findAll() {
    return await this.jobService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.jobService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthenticationGuard)
  @ApiOperation({ summary: 'Update a job' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('file', 10, { storage: storageConfig() }))
  async update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const imageUrls = (files ?? []).map(
      (f) => `${process.env.DOMAIN}/uploads/${f.filename}`,
    );

    if (imageUrls.length) {
      updateJobDto.file = imageUrls;
    }

    return await this.jobService.update(id, updateJobDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.jobService.remove(id);
  }
}
