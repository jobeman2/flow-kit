import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { prisma, PrismaClient } from '@flow-kit/database';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('PrismaService');
  public readonly client: PrismaClient = prisma;

  async onModuleInit() {
    try {
      await this.client.$connect();
      this.logger.log('[DATABASE] PostgreSQL connected successfully.');
      await this.bootstrapSchema();
    } catch (err: any) {
      this.logger.error('[DATABASE] PostgreSQL connection error:', err?.message || err);
    }
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }

  /**
   * Self-healing database schema bootstrap.
   * Ensures all required PostgreSQL enums, tables, foreign keys, and indexes
   * exist in the target database without requiring manual migration steps.
   */
  async bootstrapSchema(): Promise<{ success: boolean; message: string }> {
    try {
      // Check if the 'users' table already exists
      const tableCheck: any[] = await this.client.$queryRawUnsafe(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users';
      `);

      if (tableCheck && tableCheck.length > 0) {
        this.logger.log('[DATABASE] Schema verified: tables are already initialized.');
        return { success: true, message: 'Schema already initialized.' };
      }

      this.logger.warn('[DATABASE] Tables not found. Bootstrapping PostgreSQL schema...');

      const ddlStatements = [
        // 1. Enums
        `DO $$ BEGIN
          CREATE TYPE "OrgRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');
        EXCEPTION WHEN duplicate_object THEN null;
        END $$;`,

        `DO $$ BEGIN
          CREATE TYPE "KeyType" AS ENUM ('PUBLIC_CLIENT', 'SECRET_ADMIN');
        EXCEPTION WHEN duplicate_object THEN null;
        END $$;`,

        `DO $$ BEGIN
          CREATE TYPE "Environment" AS ENUM ('TEST', 'PRODUCTION');
        EXCEPTION WHEN duplicate_object THEN null;
        END $$;`,

        `DO $$ BEGIN
          CREATE TYPE "KeyStatus" AS ENUM ('ACTIVE', 'REVOKED');
        EXCEPTION WHEN duplicate_object THEN null;
        END $$;`,

        `DO $$ BEGIN
          CREATE TYPE "TourStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
        EXCEPTION WHEN duplicate_object THEN null;
        END $$;`,

        `DO $$ BEGIN
          CREATE TYPE "TriggerType" AS ENUM ('AUTO_FIRST_VISIT', 'URL_MATCH', 'ELEMENT_CLICK', 'PROGRAMMATIC');
        EXCEPTION WHEN duplicate_object THEN null;
        END $$;`,

        `DO $$ BEGIN
          CREATE TYPE "StepPlacement" AS ENUM ('TOP', 'BOTTOM', 'LEFT', 'RIGHT', 'CENTER');
        EXCEPTION WHEN duplicate_object THEN null;
        END $$;`,

        `DO $$ BEGIN
          CREATE TYPE "StepAction" AS ENUM ('NONE', 'CLICK_TARGET', 'INPUT_VALUE');
        EXCEPTION WHEN duplicate_object THEN null;
        END $$;`,

        `DO $$ BEGIN
          CREATE TYPE "AnalyticsEventType" AS ENUM ('TOUR_STARTED', 'STEP_VIEWED', 'STEP_COMPLETED', 'TOUR_SKIPPED', 'TOUR_COMPLETED');
        EXCEPTION WHEN duplicate_object THEN null;
        END $$;`,

        // 2. Organizations
        `CREATE TABLE IF NOT EXISTS "organizations" (
          "id" TEXT PRIMARY KEY,
          "name" TEXT NOT NULL,
          "slug" TEXT UNIQUE NOT NULL,
          "plan" TEXT NOT NULL DEFAULT 'free',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );`,

        // 3. Users
        `CREATE TABLE IF NOT EXISTS "users" (
          "id" TEXT PRIMARY KEY,
          "email" TEXT UNIQUE NOT NULL,
          "passwordHash" TEXT NOT NULL,
          "name" TEXT,
          "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
          "emailVerifyToken" TEXT UNIQUE,
          "emailVerifyExpires" TIMESTAMP(3),
          "emailVerifyOtp" TEXT,
          "emailVerifyOtpExpires" TIMESTAMP(3),
          "passwordResetToken" TEXT UNIQUE,
          "passwordResetExpires" TIMESTAMP(3),
          "refreshTokenHash" TEXT,
          "authProvider" TEXT NOT NULL DEFAULT 'LOCAL',
          "providerId" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );`,

        // 4. Organization Members
        `CREATE TABLE IF NOT EXISTS "organization_members" (
          "id" TEXT PRIMARY KEY,
          "organizationId" TEXT NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          "role" "OrgRole" NOT NULL DEFAULT 'MEMBER',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "organization_members_organizationId_userId_key" UNIQUE ("organizationId", "userId")
        );`,

        // 5. Projects
        `CREATE TABLE IF NOT EXISTS "projects" (
          "id" TEXT PRIMARY KEY,
          "organizationId" TEXT NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          "name" TEXT NOT NULL,
          "slug" TEXT NOT NULL,
          "domains" TEXT[] DEFAULT ARRAY[]::TEXT[],
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "projects_organizationId_slug_key" UNIQUE ("organizationId", "slug")
        );`,

        // 6. API Keys
        `CREATE TABLE IF NOT EXISTS "api_keys" (
          "id" TEXT PRIMARY KEY,
          "projectId" TEXT NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          "name" TEXT NOT NULL,
          "key" TEXT UNIQUE NOT NULL,
          "type" "KeyType" NOT NULL DEFAULT 'PUBLIC_CLIENT',
          "environment" "Environment" NOT NULL DEFAULT 'TEST',
          "status" "KeyStatus" NOT NULL DEFAULT 'ACTIVE',
          "lastUsedAt" TIMESTAMP(3),
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "revokedAt" TIMESTAMP(3)
        );`,

        // 7. Tours
        `CREATE TABLE IF NOT EXISTS "tours" (
          "id" TEXT PRIMARY KEY,
          "projectId" TEXT NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          "slug" TEXT NOT NULL,
          "title" TEXT NOT NULL,
          "description" TEXT,
          "status" "TourStatus" NOT NULL DEFAULT 'DRAFT',
          "triggerType" "TriggerType" NOT NULL DEFAULT 'AUTO_FIRST_VISIT',
          "targetUrlPattern" TEXT NOT NULL DEFAULT '*',
          "defaultLocale" TEXT NOT NULL DEFAULT 'en',
          "isDismissable" BOOLEAN NOT NULL DEFAULT true,
          "allowBackdropClick" BOOLEAN NOT NULL DEFAULT false,
          "themeConfig" JSONB,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "tours_projectId_slug_key" UNIQUE ("projectId", "slug")
        );`,

        // 8. Tour Steps
        `CREATE TABLE IF NOT EXISTS "tour_steps" (
          "id" TEXT PRIMARY KEY,
          "tourId" TEXT NOT NULL REFERENCES "tours"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          "stepIndex" INTEGER NOT NULL,
          "targetSelector" TEXT NOT NULL,
          "placement" "StepPlacement" NOT NULL DEFAULT 'BOTTOM',
          "i18n" JSONB NOT NULL,
          "requiredAction" "StepAction" NOT NULL DEFAULT 'NONE',
          "backdropConfig" JSONB,
          "advanceOnSelectorClick" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "tour_steps_tourId_stepIndex_key" UNIQUE ("tourId", "stepIndex")
        );`,

        // 9. Analytics Events
        `CREATE TABLE IF NOT EXISTS "analytics_events" (
          "id" TEXT PRIMARY KEY,
          "projectId" TEXT NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          "tourId" TEXT NOT NULL REFERENCES "tours"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          "tourStepId" TEXT REFERENCES "tour_steps"("id") ON DELETE SET NULL ON UPDATE CASCADE,
          "eventType" "AnalyticsEventType" NOT NULL,
          "anonymousUserId" TEXT NOT NULL,
          "locale" TEXT NOT NULL DEFAULT 'en',
          "path" TEXT NOT NULL DEFAULT '/',
          "userMetadata" JSONB,
          "clientTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );`,

        // 10. Indexes
        `CREATE INDEX IF NOT EXISTS "api_keys_key_status_idx" ON "api_keys"("key", "status");`,
        `CREATE INDEX IF NOT EXISTS "api_keys_projectId_type_idx" ON "api_keys"("projectId", "type");`,
        `CREATE INDEX IF NOT EXISTS "tours_projectId_status_idx" ON "tours"("projectId", "status");`,
        `CREATE INDEX IF NOT EXISTS "tour_steps_tourId_idx" ON "tour_steps"("tourId");`,
        `CREATE INDEX IF NOT EXISTS "analytics_events_projectId_eventType_createdAt_idx" ON "analytics_events"("projectId", "eventType", "createdAt");`,
        `CREATE INDEX IF NOT EXISTS "analytics_events_tourId_eventType_idx" ON "analytics_events"("tourId", "eventType");`,
        `CREATE INDEX IF NOT EXISTS "analytics_events_tourStepId_idx" ON "analytics_events"("tourStepId");`,
      ];

      for (const statement of ddlStatements) {
        await this.client.$executeRawUnsafe(statement);
      }

      this.logger.log('[DATABASE] PostgreSQL schema successfully bootstrapped!');
      return { success: true, message: 'PostgreSQL schema bootstrapped successfully.' };
    } catch (err: any) {
      this.logger.error('[DATABASE] Schema bootstrap error:', err?.message || err);
      return { success: false, message: err?.message || String(err) };
    }
  }
}
