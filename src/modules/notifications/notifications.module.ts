import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { firebaseAdminProvider } from './firebase-admin.provider';

@Module({
  controllers: [NotificationsController],
  providers: [firebaseAdminProvider, NotificationsService],
})
export class NotificationsModule {}
