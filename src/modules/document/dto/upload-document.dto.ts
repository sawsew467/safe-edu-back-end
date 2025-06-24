import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { DocumentTypeEnum } from '../entities/document.entity';

export class DocumentUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  image: any;

  @ApiProperty()
  @IsNotEmpty({ message: 'Tên tài liệu không được để trống' })
  document_name: string;

  @IsOptional()
  @IsEnum(DocumentTypeEnum)
  type?: DocumentTypeEnum;
}
