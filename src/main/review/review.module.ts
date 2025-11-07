import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { JwtModule } from '@nestjs/jwt';
import { HelperModule } from 'src/utils/helper/helper.module';

@Module({
  imports: [JwtModule, HelperModule],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule { }
