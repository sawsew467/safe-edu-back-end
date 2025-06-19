import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// INNER


// OUTER

import { ManagerController } from './manager.controller';
import { Manager, ManagerSchemaFactory } from './entities/manager.entity';
import { ManagerRepository } from '@repositories/manager.repository';
import { ManagerService } from './manager.service';
import { OrganizationsService } from '@modules/organizations/organizations.service';
import { OrganizationsRepository } from '@repositories/organizations.repository';
import { OrganizationsModule } from '@modules/organizations/organizations.module';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Manager.name,
        useFactory: ManagerSchemaFactory,
        inject: [],
				imports: [MongooseModule.forFeature([])],
      },
    ]),
    forwardRef(() => OrganizationsModule),
    
  ],
  controllers: [ManagerController],
  providers: [
    ManagerService,
   
    { provide: 'ManagerRepositoryInterface', useClass: ManagerRepository},
  ],
  exports: [ManagerService, 'ManagerRepositoryInterface'],
})
export class ManagerModule {}
