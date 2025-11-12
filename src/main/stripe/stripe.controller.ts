import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { Public } from 'src/guards/public.decorator';
import { CreateLoginLinkDto } from './dto/create-stripe.dto';
import { ApiBody } from '@nestjs/swagger';
import { Stripe } from 'stripe';
import { AuthenticationGuard } from 'src/guards/auth.guard';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) { }
  @Post('create-express-account')
  @UseGuards(AuthenticationGuard)
  async createExpressAccount(@Req() req: Request) {
    const account = await this.stripeService.createExpressAccount(req['userid'] as string);
    return account;
  }

  //Get Account Link
  @Post('generate-account-link')
  @Public()
  @ApiBody({ type: CreateLoginLinkDto })
  async generateAccountLink(
    @Body() body: CreateLoginLinkDto,
  ) {
    const accountLink = await this.stripeService.generateAccountLink(body.stripeAccountId);
    return accountLink;
  }

  // account retrieval can be added here
  @Post('retrieve-account')
  @Public()
  @ApiBody({ type: CreateLoginLinkDto })
  async retrieveAccount(
    @Body() body: CreateLoginLinkDto,
  ): Promise<Stripe.Account> {
    const account = await this.stripeService.retrieveAccount(body.stripeAccountId);
    return account;
  }

  @Get('/admin/stripe-info')
  @Public()
  async getStripeInfo(@Req() req: Request) {
    const info = await this.stripeService.getStripeInfo(req['userid'] as string);
    return info;
  }
}
