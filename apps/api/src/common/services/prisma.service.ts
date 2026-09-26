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
      await this.autoSeedIfEmpty();
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

  /**
   * Automatically seed default demo data if database is empty on server startup.
   */
  async autoSeedIfEmpty(): Promise<void> {
    try {
      const tourCount = await this.client.tour.count();
      if (tourCount > 0) {
        this.logger.log('[DATABASE] Verified: database has tours. Skipping auto-seed.');
        return;
      }
      this.logger.warn('[DATABASE] No tours found in database. Automatically running default seed...');
      await this.seedDefaults();
    } catch (err: any) {
      this.logger.warn('[DATABASE] Auto-seed check failed or already seeded:', err?.message || err);
    }
  }

  /**
   * Seed default Organization, Admin, Project, API Keys, and Multilingual Walkthrough.
   */
  async seedDefaults(): Promise<{ success: boolean; orgId: string; projectId: string; tourId: string }> {
    this.logger.log('[DATABASE] Seeding default organization, project, API keys, and tours...');

    // 1. Organization
    const org = await this.client.organization.upsert({
      where: { slug: 'addis-hub' },
      update: {},
      create: {
        name: 'Addis Ababa Innovation Hub',
        slug: 'addis-hub',
        plan: 'enterprise',
      },
    });

    // 2. Admin User
    const user = await this.client.user.upsert({
      where: { email: 'admin@onboardflow.com' },
      update: {
        passwordHash: '$2b$10$8AolZh5flSSjykn9qSPlbeRDMworYZj2nLsh3yii9gZ.YYc3w1Fx2',
        isEmailVerified: true,
      },
      create: {
        email: 'admin@onboardflow.com',
        passwordHash: '$2b$10$8AolZh5flSSjykn9qSPlbeRDMworYZj2nLsh3yii9gZ.YYc3w1Fx2',
        name: 'Abebe Bikila',
        isEmailVerified: true,
      },
    });

    // 3. Org Member
    await this.client.organizationMember.upsert({
      where: {
        organizationId_userId: {
          organizationId: org.id,
          userId: user.id,
        },
      },
      update: {},
      create: {
        organizationId: org.id,
        userId: user.id,
        role: 'OWNER' as any,
      },
    });

    // 4. Project
    const project = await this.client.project.upsert({
      where: {
        organizationId_slug: {
          organizationId: org.id,
          slug: 'citizen-portal',
        },
      },
      update: {
        domains: ['localhost:3000', 'localhost:3001', 'localhost:5173', 'citizen.gov.et', 'flow-kit-dashboard-three.vercel.app'],
      },
      create: {
        organizationId: org.id,
        name: 'Citizen Digital Portal',
        slug: 'citizen-portal',
        domains: ['localhost:3000', 'localhost:3001', 'localhost:5173', 'citizen.gov.et', 'flow-kit-dashboard-three.vercel.app'],
      },
    });

    // 5. API Keys (including pk_live_1ef1da9d8bf5e2d424172009 for Render production!)
    const keysToSeed = [
      { key: 'pk_test_demo_addis_13e8d9a2b5f7', name: 'Web Client Development Key', type: 'PUBLIC_CLIENT', env: 'TEST' },
      { key: 'pk_live_demo_addis_79a2f1b4c6e8', name: 'Production Web App Key', type: 'PUBLIC_CLIENT', env: 'PRODUCTION' },
      { key: 'pk_live_1ef1da9d8bf5e2d424172009', name: 'Render Production Key', type: 'PUBLIC_CLIENT', env: 'PRODUCTION' },
      { key: 'sk_live_demo_addis_99c3a1b7e4d2', name: 'Backend Admin Service Key', type: 'SECRET_ADMIN', env: 'PRODUCTION' },
    ];

    for (const k of keysToSeed) {
      await this.client.apiKey.upsert({
        where: { key: k.key },
        update: {},
        create: {
          projectId: project.id,
          name: k.name,
          key: k.key,
          type: k.type as any,
          environment: k.env as any,
          status: 'ACTIVE' as any,
        },
      });
    }

    // 6. Interactive Multilingual Tour
    const tour = await this.client.tour.upsert({
      where: {
        projectId_slug: {
          projectId: project.id,
          slug: 'welcome-citizen-walkthrough',
        },
      },
      update: {
        status: 'PUBLISHED' as any,
      },
      create: {
        projectId: project.id,
        slug: 'welcome-citizen-walkthrough',
        title: 'Citizen Portal Interactive Walkthrough',
        description: 'First-time onboarding guide for municipal services with Amharic and English support.',
        status: 'PUBLISHED' as any,
        triggerType: 'AUTO_FIRST_VISIT' as any,
        targetUrlPattern: '*',
        defaultLocale: 'en',
        isDismissable: true,
        allowBackdropClick: false,
        themeConfig: {
          primaryColor: '#2563eb',
          borderRadius: '12px',
          backdropOpacity: 0.65,
        },
      },
    });

    // 7. Tour steps
    await this.client.tourStep.deleteMany({
      where: { tourId: tour.id },
    });

    await this.client.tourStep.createMany({
      data: [
        {
          tourId: tour.id,
          stepIndex: 1,
          targetSelector: '#global-search-bar',
          placement: 'BOTTOM' as any,
          requiredAction: 'NONE' as any,
          backdropConfig: { dimOpacity: 0.6, blur: 2, clickThrough: false },
          advanceOnSelectorClick: false,
          i18n: {
            en: {
              title: 'Unified Search',
              content: 'Find municipal services, tax records, birth certificates, and trade licenses in seconds.',
              nextBtn: 'Next Step',
              backBtn: 'Back',
              skipBtn: 'Skip Tour',
            },
            am: {
              title: 'የማዘጋጃ ቤት አገልግሎት ፍለጋ',
              content: 'የከተማ አገልግሎቶችን፣ የታክስ መዝገቦችን፣ የልደት ምስክር ወረቀቶችን እና የንግድ ፈቃዶችን በፍጥነት ያግኙ።',
              nextBtn: 'ቀጣይ',
              backBtn: 'ተመለስ',
              skipBtn: 'ዝለል',
            },
            om: {
              title: 'Barbaada Tajaajila Waloo',
              content: 'Tajaajiloota magaalaa, galmee gibiraa, waraqaa ragaa dhalootaa fi heeyyama daldalaa sekondii muraasa keessatti barbaadaa.',
              nextBtn: 'Itti Aana',
              backBtn: 'Duubatti',
              skipBtn: 'Dhiisi',
            },
          },
        },
        {
          tourId: tour.id,
          stepIndex: 2,
          targetSelector: '#language-switcher',
          placement: 'BOTTOM' as any,
          requiredAction: 'NONE' as any,
          backdropConfig: { dimOpacity: 0.6, blur: 2, clickThrough: true },
          advanceOnSelectorClick: false,
          i18n: {
            en: {
              title: 'Multilingual Support',
              content: 'Switch between English, Amharic, and Afaan Oromoo seamlessly at any point.',
              nextBtn: 'Continue',
              backBtn: 'Back',
              skipBtn: 'Skip',
            },
            am: {
              title: 'የቋንቋ አማራጮች',
              content: 'በእንግሊዝኛ፣ በአማርኛ እና በአፋን ኦሮሞ መካከል በፍጥነት ይቀያይሩ።',
              nextBtn: 'ቀጥል',
              backBtn: 'ተመለስ',
              skipBtn: 'ዝለል',
            },
            om: {
              title: 'Filannoo Afaanii',
              content: 'Afaan Ingiliffaa, Oromiffaa fi Amaariffaa gidduutti salphaatti jijjiirradhaa.',
              nextBtn: 'Itti Fufi',
              backBtn: 'Duubatti',
              skipBtn: 'Dhiisi',
            },
          },
        },
        {
          tourId: tour.id,
          stepIndex: 3,
          targetSelector: '#quick-actions-grid',
          placement: 'TOP' as any,
          requiredAction: 'NONE' as any,
          backdropConfig: { dimOpacity: 0.6, blur: 2, clickThrough: false },
          advanceOnSelectorClick: false,
          i18n: {
            en: {
              title: 'Quick Services',
              content: 'Direct shortcuts to download tax clearances, apply for residency IDs, and pay utility bills.',
              nextBtn: 'Next',
              backBtn: 'Back',
              skipBtn: 'Skip',
            },
            am: {
              title: 'ፈጣን አገልግሎቶች',
              content: 'የታክስ ክሊራንስ ለማውረድ፣ ለነዋሪነት መታወቂያ ለማመልከት እና ክፍያዎችን ለመፈጸም ቀጥተኛ አቋራጮች።',
              nextBtn: 'ቀጣይ',
              backBtn: 'ተመለስ',
              skipBtn: 'ዝለል',
            },
            om: {
              title: 'Tajaajiloota Saffisaa',
              content: 'Qulqullina gibiraa buufachuuf, waraqaa eenyummaa jireenyaa iyyachuuf kallattiin fayyadamaa.',
              nextBtn: 'Itti Aana',
              backBtn: 'Duubatti',
              skipBtn: 'Dhiisi',
            },
          },
        },
        {
          tourId: tour.id,
          stepIndex: 4,
          targetSelector: '#support-help-button',
          placement: 'LEFT' as any,
          requiredAction: 'NONE' as any,
          backdropConfig: { dimOpacity: 0.6, blur: 2, clickThrough: false },
          advanceOnSelectorClick: false,
          i18n: {
            en: {
              title: 'Citizen Support Desk',
              content: 'Reach our 24/7 civic help desk via live chat or toll-free hotline whenever you need guidance.',
              nextBtn: 'Get Started',
              backBtn: 'Back',
              skipBtn: 'Finish',
            },
            am: {
              title: 'የዜጎች ድጋፍ ማዕከል',
              content: 'መመሪያ በሚፈልጉበት ጊዜ ሁሉ በ24/7 የቀጥታ ውይይት ወይም በነጻ የስልክ መስመር ያግኙን።',
              nextBtn: 'ጀምር',
              backBtn: 'ተመለስ',
              skipBtn: 'ጨርስ',
            },
            om: {
              title: 'Wiirtuu Deeggarsa Lammiilee',
              content: 'Yeroo gargaarsi isin barbaachisutti bilbila tolaa ykn sarara kallattiin nu qunnamaa.',
              nextBtn: 'Eegali',
              backBtn: 'Duubatti',
              skipBtn: 'Xumuri',
            },
          },
        },
      ],
    });

    this.logger.log('[DATABASE] Seed finished successfully.');
    return { success: true, orgId: org.id, projectId: project.id, tourId: tour.id };
  }
}
