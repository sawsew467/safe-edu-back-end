import { Inject, Injectable } from '@nestjs/common';
import { CreateOtpDto } from './dto/create-otp.dto';
import { UpdateOtpDto } from './dto/update-otp.dto';
import { OtpRepository } from '@repositories/otp.repository';

@Injectable()
export class OtpsService {
   constructor(
    @Inject('OtpRepositoryInterface')
      private readonly otp_repository: OtpRepository,
    ) {}

  async create(createOtpDto: CreateOtpDto) {
    return await this.otp_repository.create(createOtpDto);
  }

  async findAll() {
    return await this.otp_repository.findAll();
  }

  async findOne(_id: string) {
    return await this.otp_repository.findOne({_id});
  }

  async update(id: string, updateOtpDto: UpdateOtpDto) {
    return await this.otp_repository.update(id, updateOtpDto);
  }

  async remove(id: string) {
    return await this.otp_repository.remove(id) ;
  }
}
