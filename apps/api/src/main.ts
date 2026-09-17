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

  // Allowed origins for authenticated credential-bearing requests
  const ALLOWED_CREDENTIAL_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:5173',
    'https://flow-kit-dashboard-three.vercel.app',
    ...(process.env.DASHBOARD_URL ? [process.env.DASHBOARD_URL] : []),
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()) : []),
  ];

  // Secure CORS policy
  app.use((req: Request, res: Response, next: any) => {
    const origin = req.headers.origin;
    const isPublicRoute =
      req.path.startsWith('/v1/public/') ||
      req.path === '/flow-kit.js' ||
      req.path === '/sdk.js';

    if (isPublicRoute) {
      // Public SDK endpoints are accessible from any origin without ambient credentials
      res.setHeader('Access-Control-Allow-Origin', '*');
    } else if (
      origin &&
      ALLOWED_CREDENTIAL_ORIGINS.some(
        (allowed) => origin.toLowerCase() === allowed.toLowerCase() || origin.endsWith('.vercel.app'),
      )
    ) {
      // Verified origin allowed with credentials
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else if (!origin) {
      // Same-origin or non-browser client
      res.setHeader('Access-Control-Allow-Origin', '*');
    } else {
      // Untrusted 3rd-party origin: do NOT allow credentials
      res.setHeader('Access-Control-Allow-Origin', origin);
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

  // Production Health Check (Sanitized - Zero Leakage)
  server.get('/v1/system/health', async (_req: Request, res: Response) => {
    try {
      const prismaService = app.get(PrismaService);
      await prismaService.client.$queryRawUnsafe(`SELECT 1;`);
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
      });
    } catch {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
      });
    }
  });

  // System Diagnostics and Database Schema Migration Trigger (Protected)
  server.all('/v1/system/bootstrap', async (req: Request, res: Response) => {
    const secret = req.headers['x-admin-secret'] || req.query?.secret;
    const expectedSecret = process.env.INTERNAL_ADMIN_KEY || process.env.JWT_SECRET;
    if (!expectedSecret || secret !== expectedSecret) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Administrative access required.',
      });
    }

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
