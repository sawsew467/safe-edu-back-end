import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { RegistrationWithStudent } from './entities/registration-with-student.entity';
import { RegistrationWithStudentRepositoryInterface } from './interfaces/registeration-with-student.interface';

@Injectable()
export class RegistrationWithStudentService {
  constructor(
    @Inject('RegistrationWithStudentRepositoryInterface')
    private readonly registrationRepo: RegistrationWithStudentRepositoryInterface,
  ) {}

  async create(data: Partial<RegistrationWithStudent>): Promise<RegistrationWithStudent> {
    return this.registrationRepo.create(data);
  }

  async findAll() {
    return this.registrationRepo.findAll();
  }

  async findOne(id: string): Promise<RegistrationWithStudent> {
    const registration = await this.registrationRepo.findOne({ _id: id });
    if (!registration) {
      throw new NotFoundException(`Registration with id ${id} not found`);
    }
    return registration;
  }

  async update(id: string, data: Partial<RegistrationWithStudent>): Promise<RegistrationWithStudent> {
    const updated = await this.registrationRepo.update(id, data);
    if (!updated) {
      throw new NotFoundException(`Registration with id ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<boolean> {
    return this.registrationRepo.remove(id);
  }

  async softDelete(id: string): Promise<RegistrationWithStudent> {
    const deleted = await this.registrationRepo.softDelete(id);
    if (!deleted) {
      throw new NotFoundException(`Registration with id ${id} not found`);
    }
    return deleted;
  }
}
