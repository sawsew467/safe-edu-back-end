import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ResetTokenService } from './reset-token.service';
import { CreateResetTokenDto } from './dto/create-reset-token.dto';
import { UpdateResetTokenDto } from './dto/update-reset-token.dto';

@Controller('reset-token')
export class ResetTokenController {

}
