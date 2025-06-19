import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { RegistrationWithStudentService } from './registration-with-student.service';
import { RegistrationWithStudent } from './entities/registration-with-student.entity';

@Controller('registrations')
export class RegistrationWithStudentController {
  constructor(private readonly registrationService: RegistrationWithStudentService) {}

  @Post()
  async create(@Body() data: Partial<RegistrationWithStudent>): Promise<RegistrationWithStudent> {
    return this.registrationService.create(data);
  }

  @Get()
  async findAll() {
    return this.registrationService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<RegistrationWithStudent> {
    return this.registrationService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: Partial<RegistrationWithStudent>): Promise<RegistrationWithStudent> {
    return this.registrationService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.registrationService.remove(id);
  }

  @Delete('soft-delete/:id')
  async softDelete(@Param('id') id: string): Promise<RegistrationWithStudent> {
    return this.registrationService.softDelete(id);
  }
}
