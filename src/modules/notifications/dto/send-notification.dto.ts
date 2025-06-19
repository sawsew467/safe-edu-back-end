import { ApiProperty } from '@nestjs/swagger';
export class sendNotificationDTO {
  @ApiProperty()
  title: string;
  @ApiProperty()
  body: string;
  @ApiProperty()
  deviceId: string;
}