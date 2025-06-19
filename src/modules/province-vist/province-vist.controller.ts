import { Controller, Get, Post, Param,} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProvinceVisitService } from './province-vist.service';

@Controller('province-vist')
@ApiTags('Province Visit')
export class ProvinceVistController {
  constructor(private readonly provinceVistService: ProvinceVisitService) {}
  
  @Post(':provinceId')
  @ApiOperation({ summary: 'Tăng số lượng truy cập cho tỉnh'})
  async increaseVisit(@Param('provinceId') provinceId: string) {
    return await this.provinceVistService.increaseVisit(provinceId);
  }

  // @Get()
  // @ApiOperation({ summary: 'Lấy thống kê số lượng truy cập cho tỉnh'})
  // async getStats() {
  //   return await this.provinceVistService.getStats();
  // }
}
