import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateAdditionalDetailsDto {
	@ApiProperty({
		description: 'Chi tiết bổ sung về báo cáo',
		example: 'Thông tin cập nhật mới về tình hình...',
	})
	@IsString()
	additional_details: string;

	@ApiPropertyOptional({
		description: 'Ghi chú về việc cập nhật',
		example: 'Cập nhật thông tin chi tiết từ phía tổ chức',
	})
	@IsOptional()
	@IsString()
	note?: string;
}
