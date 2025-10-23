import { BadRequestException, Body, Controller, Post, Req } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { Public } from 'src/guards/public.decorator';
import { CreateAccountLinkDto, CreateLoginLinkDto } from './dto/create-stripe.dto';
import { ApiBody } from '@nestjs/swagger';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Public()
  @Post('create-express-account')
  async createExpressAccount(@Req() req: Request) {
    const account = await this.stripeService.createExpressAccount(req['userid'] as string);
    return account;
  }

  @Public()
  @Post('create-account-link')
  @ApiBody({ type: CreateAccountLinkDto })
  async createAccountLink(@Body() body: CreateAccountLinkDto) {
    const link = await this.stripeService.createAccountLink(body);
    if (!link) {
      throw new BadRequestException('Failed to create account link');
    }
    return { url: link.url, expires_at: link.expires_at };
  }

  // 3) Create login link for Express accounts so provider can access Stripe Express dashboard

  @Post('create-login-link')
  @Public()
  @ApiBody({ type: CreateLoginLinkDto })
  async createLoginLink(@Body() body: CreateLoginLinkDto) {
    console.log(body);
    const loginLink = await this.stripeService.createLoginLink(body.stripeAccountId);
    return { url: loginLink.url, created: loginLink.created };
  }
}
