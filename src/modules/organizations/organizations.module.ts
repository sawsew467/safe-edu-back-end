import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
	Organization,
	OrganizationSchemaFactory,
} from './entities/organization.entity';
import {
	SignUpLink,
	SignUpLinkSchemaFactory,
} from './entities/signup-link.entity';
import { OrganizationsRepository } from '@repositories/organizations.repository';
import { SignUpLinkRepository } from '@repositories/signup-link.repository';
import { ManagerModule } from '@modules/manager/manager.module';
import {
	Province,
	ProvinceSchema,
} from '@modules/provinces/entities/province.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
	imports: [
		MongooseModule.forFeatureAsync([
			{
				name: Organization.name,
				useFactory: OrganizationSchemaFactory,
			},
			{
				name: SignUpLink.name,
				useFactory: SignUpLinkSchemaFactory,
			},
		]),
		MongooseModule.forFeature([
			{ name: Province.name, schema: ProvinceSchema },
		]),
		ManagerModule,
	],
	controllers: [OrganizationsController],
	providers: [
		OrganizationsService,
		{
			provide: 'OrganizationsRepositoryInterface',
			useClass: OrganizationsRepository,
		},
		{
			provide: 'SignUpLinkRepositoryInterface',
			useClass: SignUpLinkRepository,
		},
	],
	exports: [
		OrganizationsService,
		'OrganizationsRepositoryInterface',
		'SignUpLinkRepositoryInterface',
	],
})
export class OrganizationsModule {}
