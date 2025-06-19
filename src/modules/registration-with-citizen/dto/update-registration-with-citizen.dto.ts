import { PartialType } from '@nestjs/mapped-types';
import { CreateRegistrationWithCitizenDto } from './create-registration-with-citizen.dto';

export class UpdateRegistrationWithCitizenDto extends PartialType(CreateRegistrationWithCitizenDto) {}
