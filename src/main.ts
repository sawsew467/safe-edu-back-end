import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configSwagger } from '@configs/api-docs.config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ValidationError } from 'class-validator';
import { ERRORS_DICTIONARY } from './constraints/error-dictionary.constraint';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { json, urlencoded } from 'express';

async function bootstrap() {
	const logger = new Logger(bootstrap.name);
	const app = await NestFactory.create<NestExpressApplication>(AppModule);
	app.enableCors({
		origin: '*', 
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
		allowedHeaders: '*', 
	});
	configSwagger(app);
	const config_service = app.get(ConfigService);
	app.useStaticAssets(join(__dirname, './served'));
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			exceptionFactory: (errors: ValidationError[]) =>
				new BadRequestException({
					message: ERRORS_DICTIONARY.VALIDATION_ERROR,
					details: errors
						.map((error) => Object.values(error.constraints))
						.flat(),
				}),
		}),
	);
	const port = process.env.PORT || config_service.get('PORT') || 4000;
	app.useGlobalInterceptors(new ResponseInterceptor());
	app.use(json({ limit: '10mb' }));
	app.use(urlencoded({ extended: true, limit: '10mb' }));

	await app.listen(port, () =>
		logger.log(`🚀 Server running on: http://localhost:${port}/api-docs`),
	);
}
bootstrap();
