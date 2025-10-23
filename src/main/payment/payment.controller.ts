import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { PaymentsService } from './payment.service';
import { CreatePaymentIntentDto, CreateTransferDto, RefundDto } from './dto/create-payment.dto';

import { AuthenticationGuard } from 'src/guards/auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // post make a customer
  @Post('make-customer')
  @UseGuards(AuthenticationGuard)
  async makeCustomer(@Req() req: Request) {
    const customer = await this.paymentsService.makeCustomer(req['userid'] as string);
    return customer;
  }

  @Post('create-payment-intent')
  async createPaymentIntent(@Req() req: Request, @Body() dto: CreatePaymentIntentDto) {
    const pi = await this.paymentsService.createPaymentIntent(dto, req['userid'] as string);
    return pi;
  }

  @Post('create-transfer')
  async createTransfer(@Req() req: Request, @Body() dto: CreateTransferDto) {
    const transfer = await this.paymentsService.createTransfer(dto);
    return transfer;
  }

  // POST /payments/refund
  @Post('refund')
  // @UseGuards(AuthGuard)
  async refundCharge(@Body() dto: RefundDto) {
    const refund = await this.paymentsService.refundCharge(dto);
    return refund;
  }
}
