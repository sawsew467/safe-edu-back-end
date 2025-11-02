import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VisitService } from './visit.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('visit')
@ApiTags('visit')
export class VisitController {
  constructor(private readonly visitService: VisitService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo bản ghi khi người dùng truy cập' })
  async logVisit(@Body() createVisit: CreateVisitDto): Promise<{ message: string }>  {
    await this.visitService.logVisit(createVisit.ipAddress);
    return { message: 'Visit logged' };
  }

  @Get('stats/7days')
  @ApiOperation({ summary: 'Số lượng truy cập 7 ngày gần nhất' })
  async getVisitStats() {
    return this.visitService.getVisitStatsLast7Days();
  }

  @Get('stats/total')
  @ApiOperation({ summary: 'Tổng lượt truy cập từ trước đến nay' })
  async getTotalVisits() {
    const total = await this.visitService.getTotalVisits();
    return { total };
  }

}
