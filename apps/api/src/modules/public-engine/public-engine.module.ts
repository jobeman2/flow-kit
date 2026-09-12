import { Module } from '@nestjs/common';
import { PublicEngineController } from './public-engine.controller';
import { PublicEngineService } from './public-engine.service';
import { PrismaService } from '../../common/services/prisma.service';
import { CacheService } from '../../common/services/cache.service';

@Module({
  controllers: [PublicEngineController],
  providers: [PublicEngineService, PrismaService, CacheService],
  exports: [PublicEngineService],
})
export class PublicEngineModule {}
