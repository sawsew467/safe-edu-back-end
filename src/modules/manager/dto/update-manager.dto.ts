import { OmitType, PartialType } from '@nestjs/swagger';
import {
	IsDateString,
	IsEnum,
	IsMongoId,
	IsNotEmpty,
	IsOptional,
	IsPhoneNumber,
	MaxLength,
} from 'class-validator';



import { CreateManagerDto } from './create-manager.dto';
import { Organization } from '@modules/organizations/entities/organization.entity';
import { GENDER } from '../entities/manager.entity';

export class UpdateManagerDto extends PartialType(
	OmitType(CreateManagerDto, ['email'] as const),
) {

	@IsOptional()
	@IsDateString()
	date_of_birth?: Date;

	@IsOptional()
	@IsEnum(GENDER)
	gender?: GENDER;

	@IsOptional()
	@MaxLength(200)
	headline?: string;

	@IsOptional()
	avatar_url?: string;

	@IsNotEmpty()
	organizationId: string[];

}
