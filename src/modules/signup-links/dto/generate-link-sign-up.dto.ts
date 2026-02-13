import { IsNotEmpty, IsOptional } from 'class-validator';

export class GenerateLinkSignUpDTO {
	@IsOptional()
	startDate?: Date;

	@IsNotEmpty({ message: 'Expiration date is required' })
	expirationDate: Date;
}
