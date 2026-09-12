import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { Request, Response } from 'express';

// Load root .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable CORS for dashboard, demo apps, and 3rd party websites
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
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
        res.setHeader('Cache-Control', 'public, max-age=3600');
        return res.sendFile(path.resolve(p));
      }
    }

    res.status(404).send('// flow-kit.js is not yet built');
  };

  server.get('/flow-kit.js', serveSdk);
  server.get('/sdk.js', serveSdk);

  const port = process.env.API_PORT || 4000;
  await app.listen(port);
  logger.log(`[HTTP] Flow-Kit API Server running on port ${port} (http://localhost:${port})`);
  logger.log(`[CDN] Universal SDK script: http://localhost:${port}/flow-kit.js`);
  logger.log(`[CDN] Legacy alias script: http://localhost:${port}/sdk.js`);
  logger.log(`[ENGINE] Public Tour Resolution: http://localhost:${port}/v1/public/tours`);
}

bootstrap();
