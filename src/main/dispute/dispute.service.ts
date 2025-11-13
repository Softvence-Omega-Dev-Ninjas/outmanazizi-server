import { Injectable } from '@nestjs/common';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { UpdateDisputeDto } from './dto/update-dispute.dto';

@Injectable()
export class DisputeService {
  async create(createDisputeDto: CreateDisputeDto, userId: string, images: string[]) {
    return {
      ...createDisputeDto,
      userId,
      pictures: images,
    }
  }

  findAll() {
    return `This action returns all dispute`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dispute`;
  }

  update(id: number, updateDisputeDto: UpdateDisputeDto) {
    return `This action updates a #${id} dispute`;
  }

  remove(id: number) {
    return `This action removes a #${id} dispute`;
  }
}
