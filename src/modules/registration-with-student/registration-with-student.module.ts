import { RegistrationWithStudentRepositoryInterface } from './interfaces/registeration-with-student.interface';
import { Module } from '@nestjs/common';
import { RegistrationWithStudentService } from './registration-with-student.service';
import { RegistrationWithStudentController } from './registration-with-student.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RegistrationWithStudent,
  RegistrationWithStudentSchemaFactory,
} from './entities/registration-with-student.entity';
import { RegistrationWithStudentRepository } from '@repositories/registration-with-student.repository';


@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: RegistrationWithStudent.name,
        useFactory: RegistrationWithStudentSchemaFactory,
        inject: [],
        imports: [],
      },
    ]),
  ],
  controllers: [RegistrationWithStudentController],
  providers: [
    RegistrationWithStudentService,
    {
      provide: 'RegistrationWithStudentRepositoryInterface',
      useClass: RegistrationWithStudentRepository,
    },
  ],
  exports: [RegistrationWithStudentService],
})
export class RegistrationWithStudentModule {}
