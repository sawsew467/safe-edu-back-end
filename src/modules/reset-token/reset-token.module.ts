import { Module } from '@nestjs/common';
import { ResetTokenService } from './reset-token.service';
import { ResetTokenController } from './reset-token.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ResetToken, ResetTokenSchemaFactory } from './entities/reset-token.entity';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: ResetToken.name,
        useFactory: ResetTokenSchemaFactory,
        inject: [],
        imports: [MongooseModule.forFeature([])],
      },
    ]),
  ],
  controllers: [ResetTokenController],
  providers: [ResetTokenService],
  exports: [MongooseModule, ResetTokenService],
})
export class ResetTokenModule {}
