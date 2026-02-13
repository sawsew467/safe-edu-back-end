import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class AdminCreateSignUpLinkDto {
	@ApiProperty({
		description: 'Organization ID to create signup link for',
		example: '507f1f77bcf86cd799439011',
	})
	@IsNotEmpty()
	@IsString()
	organizationId: string;

	@ApiProperty({
		description: 'Start date of the signup link',
		example: '2024-01-01T00:00:00Z',
		required: false,
	})
	@IsOptional()
	@IsDate()
	@Type(() => Date)
	startDate?: Date;

	@ApiProperty({
		description: 'Expiration date of the signup link',
		example: '2024-12-31T23:59:59Z',
	})
	@IsNotEmpty()
	@IsDate()
	@Type(() => Date)
	expirationDate: Date;
}
