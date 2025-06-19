import { PartialType } from '@nestjs/mapped-types';
import { CreateSupervisorDto } from './create-supervisor.dto';

export class UpdateSupervisorDto extends PartialType(CreateSupervisorDto) {}
