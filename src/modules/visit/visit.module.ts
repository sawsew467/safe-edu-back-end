import { Module } from '@nestjs/common';
import { VisitService } from './visit.service';
import { VisitController } from './visit.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Visit, VisitSchemaFactory } from './entities/visit.entity';

@Module({
    imports: [
      MongooseModule.forFeatureAsync([
        {
          name: Visit.name,
          useFactory: VisitSchemaFactory,
          inject: [],
          imports: [MongooseModule.forFeature([])],
        },
      ]),
    ],
  controllers: [VisitController],
  providers: [VisitService],
})
export class VisitModule {}
