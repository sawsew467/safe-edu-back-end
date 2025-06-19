import { PartialType } from '@nestjs/swagger';
import { CreateProvinceVistDto } from './create-province-vist.dto';

export class UpdateProvinceVistDto extends PartialType(CreateProvinceVistDto) {}
