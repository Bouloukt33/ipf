import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma';
import { ProfileModule } from './profile';
import { QuizModule } from './quiz';
import { QuestionsModule } from './questions';
import { CategoriesModule } from './categories';
import { UsersModule } from './users';
import { AdminModule } from './admin';
import { DashboardModule } from './dashboard';
import { LeaderboardModule } from './leaderboard';
import { ProgressionModule } from './progression';
import { PacksModule } from './packs';
import { SubscriptionModule } from './subscription';
import { PaymentModule } from './payment';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    AuthModule,

    PrismaModule,

    ProfileModule,
    QuizModule,
    QuestionsModule,
    CategoriesModule,
    UsersModule,
    AdminModule,
    DashboardModule,
    LeaderboardModule,
    ProgressionModule,
    PacksModule,
    SubscriptionModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
