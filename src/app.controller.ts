import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {

  @Get()
  getHello() {
    return {
      message: 'Welcome to My Outmanazizi API Server 🚀',
      status: 'OK',
      version: '1.0.0',
      docs: '/api',
    };
  }
}
