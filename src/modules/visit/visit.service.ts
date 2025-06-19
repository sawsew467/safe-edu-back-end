import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Visit } from './entities/visit.entity';
import { Model } from 'mongoose';
import * as moment from 'moment';

@Injectable()
export class VisitService {
  constructor(
    @InjectModel(Visit.name) private visitModel: Model<Visit>,
  ) {}

  async logVisit(ipAddress: string): Promise<void> {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      const lastVisit = await this.visitModel
        .findOne({ ipAddress })
        .sort({ createdAt: -1 });

      if (!lastVisit || lastVisit.timestamp < fiveMinutesAgo) {
        await this.visitModel.create({ ipAddress });
      }
    } catch (error) {
        throw new BadRequestException({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message,
          message:
            'Có lỗi xảy ra, vui lòng thử lại sau',
        });
    }
  }

  async getVisitStatsLast7Days() {
    try {
      const today = moment().startOf('day');
      const sevenDaysAgo = moment(today).subtract(6, 'days');

      const result = await this.visitModel.aggregate([
        {
          $match: {
            createdAt: {
              $gte: sevenDaysAgo.toDate(),
              $lte: today.clone().endOf('day').toDate(),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      const stats: { date: string; count: number }[] = [];
      for (let i = 0; i < 7; i++) {
        const date = moment(sevenDaysAgo).add(i, 'days').format('YYYY-MM-DD');
        const dayStat = result.find((r) => r._id === date);
        stats.push({ date, count: dayStat ? dayStat.count : 0 });
      }

      return stats;
    } catch (error) {
      throw new BadRequestException({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message,
          message:
            'Có lỗi xảy ra, vui lòng thử lại sau',
        });
    }
  }
}
