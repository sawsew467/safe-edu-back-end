import { IsNotEmpty, IsUrl } from 'class-validator';

export class CreateDocumentFileDto {

  file_name?: string;

  @IsNotEmpty({ message: 'Đường dẫn tệp tin không được để trống' })
  @IsUrl({}, { message: 'Đường dẫn tệp tin không hợp lệ' })
  file_url: string;

  file_size?: number;
}
