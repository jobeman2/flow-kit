import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { ToursModule } from './modules/tours/tours.module';
import { PublicEngineModule } from './modules/public-engine/public-engine.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { PrismaService } from './common/services/prisma.service';
import { CacheService } from './common/services/cache.service';

@Module({
  imports: [
    AuthModule,
    ProjectsModule,
    ToursModule,
    PublicEngineModule,
    AnalyticsModule,
  ],
  providers: [PrismaService, CacheService],
})
export class AppModule {}
