import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { PaymentsService } from './payment.service';
import { CreatePaymentIntentDto, CreateTransferDto, RefundDto } from './dto/create-payment.dto';
import { Public } from 'src/guards/public.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment-intent')
  @Public()
  async createPaymentIntent(@Body() dto: CreatePaymentIntentDto) {
    const pi = await this.paymentsService.createPaymentIntent(dto);
    return pi;
  }

  @Post('create-transfer')
  async createTransfer(@Body() dto: CreateTransferDto) {
    const transfer = await this.paymentsService.createTransfer({
      amountCents: dto.amountCents,
      currency: dto.currency ?? 'usd',
      destinationAcctId: dto.destinationAcctId,
      orderId: dto.orderId,
    });
    return transfer;
  }

  // POST /payments/refund
  @Post('refund')
  // @UseGuards(AuthGuard)
  async refundCharge(@Body() dto: RefundDto) {
    const refund = await this.paymentsService.refundCharge(dto);
    return refund;
  }

  // GET /payments/account/:acctId
  @Get('account/:acctId')
  @Public()
  // @UseGuards(AuthGuard) // restrict access as needed
  async retrieveAccount(@Param('acctId') acctId: string) {
    const account = await this.paymentsService.retrieveAccount(acctId);
    return account;
  }

  // GET /payments/platform-balance
  @Get('platform-balance')
  @Public()
  // @UseGuards(AuthGuard) // restrict to admin or operations
  async getPlatformBalance() {
    const balance = await this.paymentsService.getPlatformBalance();
    return balance;
  }
}
