import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Organization,
  OrganizationSchemaFactory,
} from './entities/organization.entity';
import { OrganizationsRepository } from '@repositories/organizations.repository';
import { ManagerModule } from '@modules/manager/manager.module';
import { Province, ProvinceSchema } from '@modules/provinces/entities/province.entity';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Organization.name,
        useFactory: OrganizationSchemaFactory,
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
  ],
  exports: [OrganizationsService, 'OrganizationsRepositoryInterface'],
})
export class OrganizationsModule {}
