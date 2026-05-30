import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminQuestionsController } from './admin-questions.controller';
import { AdminQuestionsService } from './admin-questions.service';
import { AdminService } from './admin.service';

@Module({
  controllers: [AdminController, AdminQuestionsController],
  providers: [AdminService, AdminQuestionsService],
  exports: [AdminService, AdminQuestionsService],
})
export class AdminModule {}
