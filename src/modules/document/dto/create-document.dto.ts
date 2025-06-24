import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';
import { DocumentTypeEnum } from '../entities/document.entity';

export class CreateDocumentFileDto {

  document_name?: string;

  file_name?: string;

  @IsNotEmpty({ message: 'Đường dẫn tệp tin không được để trống' })
  @IsUrl({}, { message: 'Đường dẫn tệp tin không hợp lệ' })
  file_url: string;

  file_size?: number;

  @IsOptional()
  @IsBoolean()
  isUploaded: boolean;

  @IsOptional()
  @IsEnum(DocumentTypeEnum)
  type?: DocumentTypeEnum;
}
