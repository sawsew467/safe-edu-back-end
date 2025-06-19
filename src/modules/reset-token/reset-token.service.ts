import { BadRequestException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ResetToken } from "./entities/reset-token.entity";
import { Model } from "mongoose";

@Injectable()
export class ResetTokenService {
  constructor(
    @InjectModel(ResetToken.name)
    private tokenModel: Model<ResetToken>,
  ) {}

  async createOtp(data: { email: string; otp: string;}) {
    try {
      const otp = await this.tokenModel.create(data);
      return otp;
    } catch (error) {
      throw new BadRequestException({
              status: HttpStatus.BAD_REQUEST,
              message: 'Đã có lỗi xảy ra khi tạo otp, vui lòng thử lại sau',
              details: `Có lỗi xảy ra khi tạo otp: ${error.message}`,
            });
    }
  }

  async findValidOtp(otp: string) {
    return this.tokenModel.findOne({
      otp
    });
  }

  async deleteOtp(otp: string) {
    return this.tokenModel.deleteOne({ otp });
  }
}
