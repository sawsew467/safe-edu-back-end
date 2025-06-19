import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local.guard';
import { JwtRefreshTokenGuard } from './guards/jwt-refresh-token.guard';
import { SignUpDto, SignUpGoogleDto } from './dto/sign-up.dto';
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiBody,
	ApiConflictResponse,
	ApiCreatedResponse,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { GoogleAuthGuard } from './guards/google-oauth.guard';
import { SignUpWithStudentDto } from './dto/sign-up-with-student.dto';
import { SignUpWithCitizenDto } from './dto/sign-up-with-citizen.dto';

import { access_token_public_key } from 'src/constraints/jwt.constraint';
import { SignInDto } from './dto/sign-in.dto';
import { VerifiedOTPDto } from './dto/verified-otp';
import { SignInTokenDto } from './dto/sign-in-token.dto';
import { JwtAccessTokenGuard } from './guards/jwt-access-token.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesEnum } from 'src/enums/roles..enum';
import { SendOTPDto } from './dto/send-otp';
import { use } from 'passport';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifiedOtpDTO } from './dto/verify-otp.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
	constructor(private readonly auth_service: AuthService) {}

	@Post('google')
	async authWithGoogle(@Body() sign_in_token: SignInTokenDto) {
		return this.auth_service.authenticateWithGoogle(sign_in_token);
	}

	@UseGuards(GoogleAuthGuard)
	@Get('google/callback')
	@ApiResponse({
		status: 401,
		description: 'Unauthorized',
		content: {
			'application/json': {
				example: {
					statusCode: 400,
					message: 'Wrong credentials!!',
					error: 'Bad Request!',
				},
			},
		},
	})
	async authWithGoogleCallback(@Req() request) {
		return request.user;
	}

	@UseGuards(GoogleAuthGuard)
	@Get('google/SupervisorCallback')
	@ApiResponse({
		status: 401,
		description: 'Unauthorized',
		content: {
			'application/json': {
				example: {
					statusCode: 400,
					message: 'Wrong credentials!!',
					error: 'Bad Request!',
				},
			},
		},
	})
	async authSupervisorWithGoogleCallback(@Req() request) {
		return request.user;
	}

	// @UseGuards(JwtRefreshTokenGuard)
	// @Post('refresh')
	// async refreshAccessToken(@Req() request) {
	// 	const { user } = request;
	// 	const access_token = this.auth_service.generateAccessToken({
	// 		user_id: user._id.toString(),
	// 	});
	// 	return {
	// 		access_token,
	// 	};
	// }

	@Get('protected')
	// @UseGuards(JwtAuthGuard)
	async protected(@Req() request) {
		const { user } = request;
		return 'Access protected resource';
	}

	@Post('sign-up-with-student')
	@ApiOperation({ summary: 'sign up with student' })
	async signUpWithStudent(@Body() sign_up_with_std_dto: SignUpWithStudentDto) {
		return await this.auth_service.signUpWithStudent(sign_up_with_std_dto);
	}

	@Post('sign-up-with-citizen')
	@ApiOperation({ summary: 'sign up with citizen' })
	async signUpWithCitizen(
		@Body() sign_up_with_citizen_dto: SignUpWithCitizenDto,
	) {
		return await this.auth_service.signUpWithCitizen(sign_up_with_citizen_dto);
	}

	@Post('sign-in')
	@ApiOperation({ summary: 'sign in' })
	async signIn(@Body() sign_in_dto: SignInDto) {
		return await this.auth_service.signIn(sign_in_dto);
	}

	@Post('verify-otp')
	@ApiOperation({ summary: 'verify-otp' })
	async verifiedOTP(@Body() verified_otp: VerifiedOTPDto) {
		return await this.auth_service.verifyOTP(
			verified_otp.phone_number,
			verified_otp.otp,
		);
	}

	@Post('send-otp')
	@ApiOperation({ summary: 'send otp to phone number' })
	async sendOTP(@Body() sendOTPDto: SendOTPDto) {
		return await this.auth_service.sendOtp(sendOTPDto.phone_number);
	}
	@Get('get-access-token')
	@ApiOperation({ summary: 'get access token' })
	@UseGuards(JwtRefreshTokenGuard, RolesGuard)
	getAccessToken(@Req() req) {
		return this.auth_service.getAccessToken(req.user);
	}

	@Get()
	sendMail(): void {
		return this.auth_service.sendMail();
	}

	@Post('forgot-password')
	@ApiOperation({ summary: 'Forgot password' })
  	async forgotPassword(@Body() dto: ForgotPasswordDto) {
    	return this.auth_service.forgotPassword(dto.email);
  	}

  	@Post('reset-password')
	@ApiOperation({ summary: 'Reset password' })
  	async resetPassword(@Body() dto: ResetPasswordDto) {
    	return this.auth_service.resetPassword(dto.otp, dto.newPassword);
  	}

	@Post('verify-otp-forgot-password')
	@ApiOperation({ summary: 'Xác minh otp cho quên mật khẩu' })
  	async verifyOtp(@Body() dto: VerifiedOtpDTO) {
    	return this.auth_service.verifyOtp(dto.otp, dto.email);
  	}
}
