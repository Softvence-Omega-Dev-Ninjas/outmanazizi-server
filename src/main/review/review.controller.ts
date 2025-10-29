import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { AuthenticationGuard } from 'src/guards/auth.guard';
import type { Request } from 'express';
@Controller('review')
@UseGuards(AuthenticationGuard)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('create-review')
  create(@Body() createReviewDto: CreateReviewDto, @Req() req: Request) {
    return this.reviewService.create(createReviewDto, req['userid'] as string);
  }

  @Get('all-reviews')
  findAll() {
    return this.reviewService.findAll();
  }
}
