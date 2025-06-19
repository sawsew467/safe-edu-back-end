import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OtpsService } from './otp.service';
import { CreateOtpDto } from './dto/create-otp.dto';
import { UpdateOtpDto } from './dto/update-otp.dto';

@Controller('otps')
export class OtpsController {
  constructor(private readonly otpsService: OtpsService) {}

  @Post()
  create(@Body() createOtpDto: CreateOtpDto) {
    return this.otpsService.create(createOtpDto);
  }

  @Get()
  findAll() {
    return this.otpsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.otpsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOtpDto: UpdateOtpDto) {
    return this.otpsService.update(id, updateOtpDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.otpsService.remove(id);
  }
}
