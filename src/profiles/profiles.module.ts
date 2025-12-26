import { Module } from '@nestjs/common';
import { ProfilesController } from './profiles.controller';
import { UsersController } from './users.controller';
import { ProfilesService } from './profiles.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProfilesController, UsersController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}


