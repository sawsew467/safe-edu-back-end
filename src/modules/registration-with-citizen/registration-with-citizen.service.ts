import { Injectable } from '@nestjs/common';
import { CreateRegistrationWithCitizenDto } from './dto/create-registration-with-citizen.dto';
import { UpdateRegistrationWithCitizenDto } from './dto/update-registration-with-citizen.dto';

@Injectable()
export class RegistrationWithCitizenService {
  create(createRegistrationWithCitizenDto: CreateRegistrationWithCitizenDto) {
    return 'This action adds a new registrationWithCitizen';
  }

  findAll() {
    return `This action returns all registrationWithCitizen`;
  }

  findOne(id: number) {
    return `This action returns a #${id} registrationWithCitizen`;
  }

  update(id: number, updateRegistrationWithCitizenDto: UpdateRegistrationWithCitizenDto) {
    return `This action updates a #${id} registrationWithCitizen`;
  }

  remove(id: number) {
    return `This action removes a #${id} registrationWithCitizen`;
  }
}
