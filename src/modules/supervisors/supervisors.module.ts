import { Module } from '@nestjs/common';
import { SupervisorsService } from './supervisors.service';
import { SupervisorsController } from './supervisors.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Supervisor, SupervisorSchemaFactory } from './entities/supervisor.entity';
import { SupervisorRepository } from '@repositories/supervisor.repository';
import { HttpModule } from '@nestjs/axios';
import { ProvincesModule } from '@modules/provinces/provinces.module';

@Module({
  imports: [
      MongooseModule.forFeatureAsync([
        {
          name: Supervisor.name,
          useFactory: SupervisorSchemaFactory,
          inject: [],
          imports: [MongooseModule.forFeature([])],
        },
      ]),
      ProvincesModule,
      HttpModule,
    ],
  controllers: [SupervisorsController],
  providers: [
    SupervisorsService,
    { provide: 'SupervisorRepositoryInterface', useClass: SupervisorRepository},
  ],
  exports: [SupervisorsService,
    'SupervisorRepositoryInterface'
  ],
})
export class SupervisorsModule {}
