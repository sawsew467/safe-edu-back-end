import { PartialType } from '@nestjs/swagger';
import { CreateResetTokenDto } from './create-reset-token.dto';

export class UpdateResetTokenDto extends PartialType(CreateResetTokenDto) {}
