import { Module } from '@nestjs/common';
import { UserAchievementsService } from './user-achievements.service';
import { UserAchievementsController } from './user-achievements.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAchievement, UserAchievementSchemaFactory } from './entities/user-achievement.entity';

@Module({
  imports: [
      MongooseModule.forFeatureAsync([
        {
          name: UserAchievement.name,
          useFactory: UserAchievementSchemaFactory,
      inject: [],
      imports: [MongooseModule.forFeature([])],
        }
    ])
  ],
  controllers: [UserAchievementsController],
  providers: [UserAchievementsService],
})
export class UserAchievementsModule {}
