import { ApiProperty } from '@nestjs/swagger';

export class ValidateSignUpLinkResponseDto {
	@ApiProperty({
		description: 'Whether the signup link is valid',
		example: true,
	})
	isValid: boolean;

	@ApiProperty({
		description: 'Organization ID if the link is valid',
		example: '507f1f77bcf86cd799439011',
		required: false,
	})
	organizationId?: string;

	@ApiProperty({
		description: 'Message describing the validation result',
		example: 'Sign-up link is valid',
	})
	message: string;

	@ApiProperty({
		description: 'Organization name if the link is valid',
		required: false,
	})
	organizationName?: string;
}
