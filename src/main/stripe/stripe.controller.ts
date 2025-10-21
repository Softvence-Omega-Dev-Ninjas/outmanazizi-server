import { BadRequestException, Body, Controller, Get, Param, Post, Req, } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { Public } from 'src/guards/public.decorator';
import { CreateAccountLinkDto, CreateLoginLinkDto, CreateStripeDto } from './dto/create-stripe.dto';
import { ApiBody } from '@nestjs/swagger';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) { }

  @Public()
  @Post('create-express-account')
  @ApiBody({ type: CreateStripeDto })
  async createExpressAccount(@Req() req: Request, @Body() body: CreateStripeDto) {
    const account = await this.stripeService.createExpressAccount(body);
    if (!account) {
      throw new BadRequestException('Failed to create Stripe account');
    }
    return { stripeAccountId: account.id };
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

  @Get(':stripeAccountId/status')
  @Public()
  async getAccountStatus(@Param('stripeAccountId') stripeAccountId: string) {
    const acct = await this.stripeService.retrieveAccount(stripeAccountId);
    return {
      id: acct.id,
      charges_enabled: acct.charges_enabled,
      payouts_enabled: acct.payouts_enabled,
      requirements: acct.requirements, // contains pending verification fields
    };
  }
}
