import { Controller, Get, Post } from '@nestjs/common';
import { ProvinceService } from './provinces.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('provinces')
@ApiTags('Provinces')
export class ProvinceController {
  constructor(private readonly provinceService: ProvinceService) {}

  @Get()
  async getProvinces() {
    return this.provinceService.getProvinces();
  }

  @Get('stats')
  @ApiOperation({summary: 'Thống kê số lượng truy cập của các tỉnh'})
  async getViewFromProvinces() {
    return await this.provinceService.getAllProvincesWithVisitCount();
  }

  @Post()
  @ApiOperation({summary: 'Add province into database'})
  async saveProvinceIntoDatabase() {
    return await this.provinceService.addProvinceIntoDatabase();
  }

  @Get('all')
  @ApiOperation({summary: 'Retrive all province'})
  async getAllProvince() {
    return await this.provinceService.findAll();
  }
}
