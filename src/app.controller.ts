import { Controller, Get } from '@nestjs/common';
import { Public } from './guards/public.decorator';

@Controller()
export class AppController {
  @Get()
  @Public()
  getHello() {
    return {
      message: 'Welcome to My Outmanazizi API Server 🚀',
      status: 'OK',
      version: '1.0.0',
      docs: '/api',
    };
  }
}
