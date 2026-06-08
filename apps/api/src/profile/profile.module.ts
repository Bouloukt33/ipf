import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ReferenceController } from './reference.controller';
import { ProfileService } from './profile.service';

@Module({
  controllers: [ProfileController, ReferenceController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
