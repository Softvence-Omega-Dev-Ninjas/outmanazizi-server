import { BadRequestException, Body, Controller, Post, Req } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { Public } from 'src/guards/public.decorator';
import { CreateAccountLinkDto, CreateLoginLinkDto } from './dto/create-stripe.dto';
import { ApiBody } from '@nestjs/swagger';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}
  @Post('create-express-account')
  async createExpressAccount(@Req() req: Request) {
    const account = await this.stripeService.createExpressAccount(req['userid'] as string);
    return account;
  }

  @Public()
  @Post('create-account-link')
  @ApiBody({ type: CreateAccountLinkDto })
  async createAccountLink(
    @Body() body: CreateAccountLinkDto,
  ): Promise<{ url: string; expires_at: number }> {
    const link = await this.stripeService.createAccountLink(body);
    if (!link) {
      throw new BadRequestException('Failed to create account link');
    }
    return { url: link.url, expires_at: link.expires_at };
  }

  @ApiBody({ type: CreateLoginLinkDto })
  @Post('create-login-link')
  @ApiBody({ type: CreateLoginLinkDto })
  async createLoginLink(
    @Body() body: CreateLoginLinkDto,
  ): Promise<{ url: string; created: number }> {
    const loginLink = await this.stripeService.createLoginLink(body.stripeAccountId);
    return { url: loginLink.url, created: loginLink.created };
  }
}
