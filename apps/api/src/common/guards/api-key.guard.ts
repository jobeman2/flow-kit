import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { CacheService } from '../services/cache.service';
import { KeyStatus } from '@flow-kit/database';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const apiKeyHeader =
      req.headers['x-api-key'] ||
      req.query?.apiKey ||
      req.headers['authorization']?.replace(/^Bearer\s+/i, '');

    if (!apiKeyHeader || typeof apiKeyHeader !== 'string') {
      throw new UnauthorizedException('API Key missing. Provide via "x-api-key" header.');
    }

    const keyString = apiKeyHeader.trim();
    const cacheKey = `apikey:${keyString}`;

    // 1. Check cache
    const cachedData = await this.cache.get(cacheKey);
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      req.apiKey = parsed.apiKey;
      req.project = parsed.project;
      return true;
    }

    // 2. Query DB
    const keyRecord = await this.prisma.client.apiKey.findUnique({
      where: { key: keyString },
      include: {
        project: {
          include: { organization: true },
        },
      },
    });

    if (!keyRecord || keyRecord.status !== KeyStatus.ACTIVE) {
      throw new UnauthorizedException('Invalid or revoked API Key.');
    }

    // Update lastUsedAt asynchronously
    this.prisma.client.apiKey
      .update({
        where: { id: keyRecord.id },
        data: { lastUsedAt: new Date() },
      })
      .catch(() => {});

    // Cache key for 5 minutes
    await this.cache.set(
      cacheKey,
      JSON.stringify({ apiKey: keyRecord, project: keyRecord.project }),
      300,
    );

    req.apiKey = keyRecord;
    req.project = keyRecord.project;
    return true;
  }
}
