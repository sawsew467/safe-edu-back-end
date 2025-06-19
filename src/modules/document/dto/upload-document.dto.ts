import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class DocumentUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  image: any;

  @ApiProperty()
  @IsNotEmpty({ message: 'Tên tài liệu không được để trống' })
  document_name: string;
}
