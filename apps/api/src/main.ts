import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { Request, Response } from 'express';
import { PrismaService } from './common/services/prisma.service';

// Load root .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable CORS for dashboard, demo apps, file:// protocol, and 3rd party websites
  app.use((req: Request, res: Response, next: any) => {
    const origin = req.headers.origin;
    if (!origin || origin === 'null') {
      res.setHeader('Access-Control-Allow-Origin', '*');
    } else {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, x-api-key, *');

    // Chrome Private Network Access (PNA) support for local development
    if (req.headers['access-control-request-private-network']) {
      res.setHeader('Access-Control-Allow-Private-Network', 'true');
    }

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    next();
  });

  // Serve standalone Universal Client SDK at GET /flow-kit.js and GET /sdk.js
  const server = app.getHttpAdapter().getInstance();
  const serveSdk = (_req: Request, res: Response) => {
    const candidatePaths = [
      path.resolve(__dirname, '../../packages/sdk-web/dist/sdk.js'),
      path.resolve(__dirname, '../../../packages/sdk-web/dist/sdk.js'),
      path.resolve(process.cwd(), 'packages/sdk-web/dist/sdk.js'),
      path.resolve(process.cwd(), '../packages/sdk-web/dist/sdk.js'),
      'd:/Thrive Inc/Onboard/packages/sdk-web/dist/sdk.js',
    ];

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Private-Network', 'true');
        return res.sendFile(path.resolve(p));
      }
    }

    res.status(404).send('// flow-kit.js is not yet built');
  };

  server.get('/flow-kit.js', serveSdk);
  server.get('/sdk.js', serveSdk);

  // System Diagnostics and Database Self-Healing Trigger
  server.get('/v1/system/health', async (_req: Request, res: Response) => {
    try {
      const prismaService = app.get(PrismaService);
      const tableRows: any[] = await prismaService.client.$queryRawUnsafe(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public';
      `);
      const tables = tableRows.map((r: any) => r.table_name || r.TABLE_NAME);
      const dbUrl = process.env.DATABASE_URL || '';
      const maskedDb = dbUrl.replace(/:([^:@]+)@/, ':****@');

      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
        databaseTarget: maskedDb,
        tables,
        tablesReady: tables.includes('users') && tables.includes('projects'),
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'database_error',
        message: err?.message || String(err),
      });
    }
  });

  server.all('/v1/system/bootstrap', async (_req: Request, res: Response) => {
    try {
      const prismaService = app.get(PrismaService);
      const result = await prismaService.bootstrapSchema();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err?.message || String(err),
      });
    }
  });

  const port = process.env.API_PORT || 4000;
  await app.listen(port);
  logger.log(`[HTTP] Flow-Kit API Server running on port ${port} (http://localhost:${port})`);
  logger.log(`[CDN] Universal SDK script: http://localhost:${port}/flow-kit.js`);
  logger.log(`[CDN] Legacy alias script: http://localhost:${port}/sdk.js`);
  logger.log(`[ENGINE] Public Tour Resolution: http://localhost:${port}/v1/public/tours`);
}

bootstrap();
