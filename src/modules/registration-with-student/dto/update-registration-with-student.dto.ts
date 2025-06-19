import { PartialType } from '@nestjs/mapped-types';
import { CreateRegistrationWithStudentDto } from './create-registration-with-student.dto';

export class UpdateRegistrationWithStudentDto extends PartialType(CreateRegistrationWithStudentDto) {}
