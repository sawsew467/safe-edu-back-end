import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RegistrationWithCitizenService } from './registration-with-citizen.service';
import { CreateRegistrationWithCitizenDto } from './dto/create-registration-with-citizen.dto';
import { UpdateRegistrationWithCitizenDto } from './dto/update-registration-with-citizen.dto';

@Controller('registration-with-citizen')
export class RegistrationWithCitizenController {
  constructor(private readonly registrationWithCitizenService: RegistrationWithCitizenService) {}

  @Post()
  create(@Body() createRegistrationWithCitizenDto: CreateRegistrationWithCitizenDto) {
    return this.registrationWithCitizenService.create(createRegistrationWithCitizenDto);
  }

  @Get()
  findAll() {
    return this.registrationWithCitizenService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.registrationWithCitizenService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRegistrationWithCitizenDto: UpdateRegistrationWithCitizenDto) {
    return this.registrationWithCitizenService.update(+id, updateRegistrationWithCitizenDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.registrationWithCitizenService.remove(+id);
  }
}
