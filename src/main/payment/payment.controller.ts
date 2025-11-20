import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { PaymentsService } from './payment.service';
import { CreatePaymentIntentDto, CreateTransferDto } from './dto/create-payment.dto';

import { AuthenticationGuard } from 'src/guards/auth.guard';
import { MakeCustomerDto } from './dto/makeCustomer.dto';
import { RefundDto } from './dto/refund.dto';
import { RolesGuard } from 'src/guards/role.guard';
import { Roles } from 'src/guards/roles.decorator';
import { UserRole } from '../auth/role.enum';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  // post make a customer
  @Post('make-customer')
  @UseGuards(AuthenticationGuard)
  async makeCustomer(@Req() req: Request, @Body() makeCustomerDto: MakeCustomerDto) {
    const customer = await this.paymentsService.makeCustomer(req['userid'] as string, makeCustomerDto);
    return customer;
  }

  @Post('create-payment-intent')
  async createPaymentIntent(@Req() req: Request, @Body() dto: CreatePaymentIntentDto) {
    const pi = await this.paymentsService.createPaymentIntent(dto, req['userid'] as string);
    return pi;
  }

  @Post('create-transfer')
  @UseGuards(AuthenticationGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async createTransfer(@Body() dto: CreateTransferDto, @Req() req: Request) {
    const transfer = await this.paymentsService.createTransfer(req['userid'] as string, dto);
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
