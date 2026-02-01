import { Module } from '@nestjs/common';
import { TypeBailsController } from './type-bails.controller';
import { TypeBailsService } from './type-bails.service';

@Module({
  controllers: [TypeBailsController],
  providers: [TypeBailsService],
  exports: [TypeBailsService],
})
export class TypeBailsModule {}
