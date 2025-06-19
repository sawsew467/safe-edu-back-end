import { Module } from '@nestjs/common';
import { OtpsService } from './otp.service';
import { OtpsController } from './otp.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Otp, OtpSchemaFactory } from './entities/otp.entity';
import { OtpRepository } from '@repositories/otp.repository';

@Module({
  imports: [
      MongooseModule.forFeatureAsync([{
        name: Otp.name,
        useFactory: OtpSchemaFactory,
          inject: [],
          imports: [MongooseModule.forFeature([])],
      }
    ]),
  ],
  controllers: [OtpsController],
  providers: [
    OtpsService,
    { provide: 'OtpRepositoryInterface', 
      useClass: OtpRepository
    }
  ],
  exports: [OtpsService, 'OtpRepositoryInterface'],
})
export class OtpModule {}
