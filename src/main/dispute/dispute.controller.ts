import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DisputeService } from './dispute.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { UpdateDisputeDto } from './dto/update-dispute.dto';

@Controller('dispute')
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Post()
  create(@Body() createDisputeDto: CreateDisputeDto) {
    return this.disputeService.create(createDisputeDto);
  }

  @Get()
  findAll() {
    return this.disputeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.disputeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDisputeDto: UpdateDisputeDto) {
    return this.disputeService.update(+id, updateDisputeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.disputeService.remove(+id);
  }
}
