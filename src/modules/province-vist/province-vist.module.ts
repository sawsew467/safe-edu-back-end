import { Module } from '@nestjs/common';
import { ProvinceVistController } from './province-vist.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ProvinceVisit, ProvinceVisitSchemaFactory } from './entities/province-vist.entity';
import { ProvinceVisitService } from './province-vist.service';

@Module({
  imports: [
      MongooseModule.forFeatureAsync([
        {
          name: ProvinceVisit.name,
          useFactory: ProvinceVisitSchemaFactory,
          inject: [],
          imports: [MongooseModule.forFeature([])],
        },
      ]),
    ],
  controllers: [ProvinceVistController],
  providers: [ProvinceVisitService],
  exports: [ProvinceVisitService],
})
export class ProvinceVisitModule {}
