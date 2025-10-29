import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsString,
	IsOptional,
	IsArray,
	IsBoolean,
	IsMongoId,
	IsEnum,
} from 'class-validator';
import { ImpactLevel } from 'src/enums/impact-level.enum';
import { CurrentSituation } from 'src/enums/current-situation.enum';

export class CreateReportDto {
	@ApiPropertyOptional({ description: 'Tên nạn nhân' })
	@IsOptional()
	@IsString()
	victim_name?: string;

	@ApiProperty({ description: 'Lớp học' })
	@IsString()
	class_grade: string;

	@ApiPropertyOptional({ description: 'Giới tính' })
	@IsOptional()
	@IsString()
	gender?: string;

	@ApiPropertyOptional({ description: 'Mối quan hệ với nạn nhân' })
	@IsOptional()
	@IsString()
	relationship_to_victim?: string;

	@ApiPropertyOptional({ description: 'Mối quan hệ khác' })
	@IsOptional()
	@IsString()
	relationship_other?: string;

	@ApiPropertyOptional({ description: 'Các loại bạo lực', type: [String] })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	violence_types?: string[];

	@ApiPropertyOptional({ description: 'Loại bạo lực khác' })
	@IsOptional()
	@IsString()
	violence_other?: string;

	@ApiPropertyOptional({ description: 'Địa điểm' })
	@IsOptional()
	@IsString()
	location?: string;

	@ApiPropertyOptional({ description: 'Địa điểm khác' })
	@IsOptional()
	@IsString()
	location_other?: string;

	@ApiPropertyOptional({ description: 'Thời gian xảy ra' })
	@IsOptional()
	@IsString()
	time_of_incident?: string;

	@ApiPropertyOptional({
		description: 'Mức độ ảnh hưởng',
		enum: ImpactLevel,
		example: ImpactLevel.MODERATE,
	})
	@IsOptional()
	@IsEnum(ImpactLevel)
	impact_level?: ImpactLevel;

	@ApiPropertyOptional({
		description: 'Tình trạng hiện tại',
		enum: CurrentSituation,
		example: CurrentSituation.STILL_HAPPENING,
	})
	@IsOptional()
	@IsEnum(CurrentSituation)
	current_situation?: CurrentSituation;

	@ApiPropertyOptional({ description: 'Nguồn thông tin', type: [String] })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	information_sources?: string[];

	@ApiPropertyOptional({ description: 'Độ tin cậy thông tin' })
	@IsOptional()
	@IsString()
	information_reliability?: string;

	@ApiPropertyOptional({ description: 'Tùy chọn liên hệ' })
	@IsOptional()
	@IsBoolean()
	contact_option?: boolean;

	@ApiPropertyOptional({ description: 'Thông tin liên hệ' })
	@IsOptional()
	@IsString()
	contact_info?: string;

	@ApiPropertyOptional({ description: 'Thông tin liên hệ bên ngoài' })
	@IsOptional()
	@IsString()
	external_contact_info?: string;

	@ApiPropertyOptional({ description: 'Bằng chứng (file)' })
	@IsOptional()
	@IsString({ each: true })
	evidence?: string[];

	@ApiProperty({ description: 'ID tổ chức' })
	@IsMongoId()
	organizationId: string;
}
