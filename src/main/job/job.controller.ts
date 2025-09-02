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
} from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { AuthenticationGuard } from 'src/guards/auth.guard';
import type { Request } from 'express';

@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  // Create a new job
  @Post('create-job')
  @UseGuards(AuthenticationGuard)
  create(@Body() createJobDto: CreateJobDto, @Req() req: Request) {
    console.log(req);
    return this.jobService.create(req['userid'] as string, createJobDto);
  }

  @Get()
  @UseGuards(AuthenticationGuard)
  findAll() {
    return this.jobService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
    return this.jobService.update(id, updateJobDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobService.remove(id);
  }
}
