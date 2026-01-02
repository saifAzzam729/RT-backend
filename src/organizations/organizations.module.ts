import { Module } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TendersModule } from '../tenders/tenders.module';

@Module({
  imports: [PrismaModule, TendersModule],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}


