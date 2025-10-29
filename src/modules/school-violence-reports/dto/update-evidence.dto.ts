import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional } from 'class-validator';

export class UpdateEvidenceDto {
  @ApiProperty({ description: 'URL của bằng chứng mới', type: [String] })
  @IsArray()
  @IsString({ each: true })
  evidenceUrls: string[];

  @ApiPropertyOptional({ description: 'Ghi chú về bằng chứng' })
  @IsString()
  @IsOptional()
  note?: string;
}
