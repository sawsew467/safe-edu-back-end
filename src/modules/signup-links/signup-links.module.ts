import { Module } from '@nestjs/common';
import { SignupLinksService } from './signup-links.service';
import { SignupLinksController } from './signup-links.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
	SignUpLink,
	SignUpLinkSchemaFactory,
} from './entities/signup-link.entity';
import { SignUpLinkRepository } from '@repositories/signup-link.repository';
import { OrganizationsModule } from '@modules/organizations/organizations.module';

@Module({
	imports: [
		MongooseModule.forFeatureAsync([
			{
				name: SignUpLink.name,
				useFactory: SignUpLinkSchemaFactory,
			},
		]),
		OrganizationsModule,
	],
	controllers: [SignupLinksController],
	providers: [
		SignupLinksService,
		{
			provide: 'SignUpLinkRepositoryInterface',
			useClass: SignUpLinkRepository,
		},
	],
	exports: [
		SignupLinksService,
		'SignUpLinkRepositoryInterface',
	],
})
export class SignupLinksModule {}
