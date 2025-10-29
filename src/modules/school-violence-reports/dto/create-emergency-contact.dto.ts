import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsMongoId } from 'class-validator';

export class CreateEmergencyContactDto {
	@ApiProperty({ description: 'Tên liên hệ khẩn cấp' })
	@IsString()
	name: string;

	@ApiProperty({ description: 'Số điện thoại' })
	@IsString()
	phoneNumber: string;

	@ApiProperty({ description: 'Email' })
	@IsEmail()
	email: string;

	@ApiPropertyOptional({ description: 'ID tổ chức (null = global)' })
	@IsOptional()
	@IsMongoId()
	organizationId?: string;
}
