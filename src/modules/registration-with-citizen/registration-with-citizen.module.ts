import { Module } from '@nestjs/common';
import { RegistrationWithCitizenService } from './registration-with-citizen.service';
import { RegistrationWithCitizenController } from './registration-with-citizen.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { RegistrationWithCitizen, RegistrationWithCitizenSchemaFactory } from './entities/registration-with-citizen.entity';

@Module({
  imports: [
      MongooseModule.forFeatureAsync([
        {
          name: RegistrationWithCitizen.name,
          useFactory: RegistrationWithCitizenSchemaFactory,
      inject: [],
      imports: [MongooseModule.forFeature([])],
        }
    ])
  ],
  controllers: [RegistrationWithCitizenController],
  providers: [RegistrationWithCitizenService],
})
export class RegistrationWithCitizenModule {}
