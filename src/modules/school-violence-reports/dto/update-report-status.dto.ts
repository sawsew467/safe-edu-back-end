import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateReportStatusDto {
  @ApiProperty({ description: 'Trạng thái báo cáo' })
  @IsString()
  status: string;

  @ApiProperty({ description: 'Ghi chú về thay đổi trạng thái', required: false })
  @IsString()
  @IsOptional()
  note?: string;
}
