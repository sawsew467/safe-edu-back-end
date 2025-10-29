import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsMongoId, IsEnum } from 'class-validator';

export enum EmergencyContactRoleEnum {
	BOARD_OF_DIRECTORS = 'board-of-directors',
	PRINCIPAL = 'principal',
	VICE_PRINCIPAL = 'vice-principal',
	STUDENT_AFFAIRS_OFFICER = 'student-affairs-officer',
}

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

	@ApiPropertyOptional({
		description: 'Vai trò của liên hệ khẩn cấp',
		enum: EmergencyContactRoleEnum,
		example: EmergencyContactRoleEnum.PRINCIPAL,
	})
	@IsOptional()
	@IsEnum(EmergencyContactRoleEnum)
	role?: EmergencyContactRoleEnum;

	@ApiPropertyOptional({ description: 'ID tổ chức (null = global)' })
	@IsOptional()
	@IsMongoId()
	organizationId?: string;
}
