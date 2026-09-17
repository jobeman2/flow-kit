import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { CacheService } from '../services/cache.service';
import { KeyStatus, KeyType, Environment } from '@flow-kit/database';

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
    let keyRecord: any;
    const cachedData = await this.cache.get(cacheKey);
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      keyRecord = parsed.apiKey;
      req.apiKey = parsed.apiKey;
      req.project = parsed.project;
    } else {
      // 2. Query DB
      try {
        keyRecord = await this.prisma.client.apiKey.findUnique({
          where: { key: keyString },
          include: {
            project: {
              include: { organization: true },
            },
          },
        });
      } catch (dbErr: any) {
        throw new UnauthorizedException('Database unavailable or invalid API Key.');
      }

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
    }

    // 3. Domain Whitelist Validation for Public Client Keys
    if (keyRecord.type === KeyType.PUBLIC_CLIENT) {
      const domains = keyRecord.project?.domains || [];
      const originHeader = (req.headers['origin'] || req.headers['referer']) as string | undefined;

      if (domains.length > 0 && !domains.includes('*') && originHeader) {
        try {
          const originUrl = new URL(typeof originHeader === 'string' ? originHeader : originHeader[0]);
          const originHostname = originUrl.hostname.toLowerCase();
          const originHostWithPort = originUrl.host.toLowerCase();

          const isAllowed = domains.some((d: string) => {
            const cleanDomain = d.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
            if (cleanDomain === '*' || cleanDomain === '') return true;
            if (originHostname === cleanDomain || originHostWithPort === cleanDomain) return true;
            if (originHostname.endsWith(`.${cleanDomain}`)) return true;
            if (
              keyRecord.environment === Environment.TEST &&
              (originHostname === 'localhost' || originHostname === '127.0.0.1')
            ) {
              return true;
            }
            return false;
          });

          if (!isAllowed) {
            throw new UnauthorizedException(`Origin '${originHeader}' is not authorized to use this API Key.`);
          }
        } catch (err: any) {
          if (err instanceof UnauthorizedException) throw err;
        }
      }
    }

    return true;
  }
}
