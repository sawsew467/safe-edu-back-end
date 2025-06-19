import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProvinceController } from './provinces.controller';
import { ProvinceService } from './provinces.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Province, ProvinceSchemaFactory } from './entities/province.entity';
import { ProvinceRepository } from '@repositories/province.repository';

@Module({
  imports: [
      MongooseModule.forFeatureAsync([
        {
          name: Province.name,
          useFactory: ProvinceSchemaFactory,
          inject: [],
          imports: [MongooseModule.forFeature([])],
        },
      ]),
      HttpModule,
    ],
  controllers: [ProvinceController],
  providers: [
    ProvinceService,
    { provide: 'ProvinceRepositoryInterface', 
      useClass: ProvinceRepository
    },
  ],
  exports: [ProvinceService, MongooseModule,  HttpModule, 'ProvinceRepositoryInterface'],
})
export class ProvincesModule {}
