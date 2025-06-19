import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException) 
export class GlobalExceptionFilter implements ExceptionFilter {
	catch(exception: BadRequestException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();

		const status = exception.getStatus();
		const message = exception.getResponse();

		response.status(status).json({
			statusCode: status,
			message: message['message'] || message,
			error: message,
		});
	}
}