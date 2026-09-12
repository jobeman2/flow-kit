import { PrismaClient, OrgRole, KeyType, Environment, KeyStatus, TourStatus, TriggerType, StepPlacement, StepAction } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting OnboardFlow database seed...');

  // 1. Create or upsert default Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'addis-hub' },
    update: {},
    create: {
      name: 'Addis Ababa Innovation Hub',
      slug: 'addis-hub',
      plan: 'enterprise',
    },
  });
  console.log(`✓ Organization ready: ${org.name} (${org.id})`);

  // 2. Create or upsert Admin User (password: 'password123')
  // SHA-256 for 'password123': ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f
  const user = await prisma.user.upsert({
    where: { email: 'admin@onboardflow.com' },
    update: {},
    create: {
      email: 'admin@onboardflow.com',
      passwordHash: '$2b$10$epRfZWvgw45wN0fH6oUG6.pU3zTq6e8a4q3rM5i1d6zW1n4f.k8k2', // pre-hashed demo pass
      name: 'Abebe Bikila',
    },
  });

  // 3. Create Org Member
  await prisma.organizationMember.upsert({
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
      role: OrgRole.OWNER,
    },
  });
  console.log(`✓ Admin user assigned: ${user.email}`);

  // 4. Create Project
  const project = await prisma.project.upsert({
    where: {
      organizationId_slug: {
        organizationId: org.id,
        slug: 'citizen-portal',
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Citizen Digital Portal',
      slug: 'citizen-portal',
      domains: ['localhost:3000', 'localhost:5173', 'citizen.gov.et'],
    },
  });
  console.log(`✓ Project ready: ${project.name} (${project.id})`);

  // 5. Create API Keys
  const testKey = await prisma.apiKey.upsert({
    where: { key: 'pk_test_demo_addis_13e8d9a2b5f7' },
    update: {},
    create: {
      projectId: project.id,
      name: 'Web Client Development Key',
      key: 'pk_test_demo_addis_13e8d9a2b5f7',
      type: KeyType.PUBLIC_CLIENT,
      environment: Environment.TEST,
      status: KeyStatus.ACTIVE,
    },
  });

  const liveKey = await prisma.apiKey.upsert({
    where: { key: 'pk_live_demo_addis_79a2f1b4c6e8' },
    update: {},
    create: {
      projectId: project.id,
      name: 'Production Web App Key',
      key: 'pk_live_demo_addis_79a2f1b4c6e8',
      type: KeyType.PUBLIC_CLIENT,
      environment: Environment.PRODUCTION,
      status: KeyStatus.ACTIVE,
    },
  });

  const secretKey = await prisma.apiKey.upsert({
    where: { key: 'sk_live_demo_addis_99c3a1b7e4d2' },
    update: {},
    create: {
      projectId: project.id,
      name: 'Backend Admin Service Key',
      key: 'sk_live_demo_addis_99c3a1b7e4d2',
      type: KeyType.SECRET_ADMIN,
      environment: Environment.PRODUCTION,
      status: KeyStatus.ACTIVE,
    },
  });
  console.log(`✓ API Keys created:\n  - Public Test: ${testKey.key}\n  - Public Live: ${liveKey.key}\n  - Secret: ${secretKey.key}`);

  // 6. Create Interactive Multilingual Tour
  const tour = await prisma.tour.upsert({
    where: {
      projectId_slug: {
        projectId: project.id,
        slug: 'welcome-citizen-walkthrough',
      },
    },
    update: {
      status: TourStatus.PUBLISHED,
    },
    create: {
      projectId: project.id,
      slug: 'welcome-citizen-walkthrough',
      title: 'Citizen Portal Interactive Walkthrough',
      description: 'First-time onboarding guide for municipal services with Amharic and English support.',
      status: TourStatus.PUBLISHED,
      triggerType: TriggerType.AUTO_FIRST_VISIT,
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

  // 7. Delete existing steps to avoid conflicts and re-create steps
  await prisma.tourStep.deleteMany({
    where: { tourId: tour.id },
  });

  await prisma.tourStep.createMany({
    data: [
      {
        tourId: tour.id,
        stepIndex: 1,
        targetSelector: '#global-search-bar',
        placement: StepPlacement.BOTTOM,
        requiredAction: StepAction.NONE,
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
            skipBtn: 'Darbii',
          },
        },
      },
      {
        tourId: tour.id,
        stepIndex: 2,
        targetSelector: '#language-switcher',
        placement: StepPlacement.BOTTOM,
        requiredAction: StepAction.NONE,
        backdropConfig: { dimOpacity: 0.6, blur: 2, clickThrough: true },
        advanceOnSelectorClick: false,
        i18n: {
          en: {
            title: 'Switch Your Language',
            content: 'The entire portal and all onboarding tours are natively available in English, Amharic, and Afaan Oromoo.',
            nextBtn: 'Continue',
            backBtn: 'Back',
            skipBtn: 'Skip',
          },
          am: {
            title: 'ቋንቋዎን ይምረጡ',
            content: 'መላው ፖርታል እና የጉዞ መመሪያዎች በእንግሊዝኛ፣ በአማርኛ እና በአፋን ኦሮሞ በተሟላ ሁኔታ ይገኛሉ።',
            nextBtn: 'ቀጥል',
            backBtn: 'ተመለስ',
            skipBtn: 'ዝለል',
          },
          om: {
            title: 'Afaan Keessan Jijjiiraa',
            content: 'Marsariitiin guutuun fi qajeelfamoonni hundi Afaan Ingilizii, Afaan Oromoo fi Amaaraatiin ni argamu.',
            nextBtn: 'Itti Fufi',
            backBtn: 'Duubatti',
            skipBtn: 'Darbii',
          },
        },
      },
      {
        tourId: tour.id,
        stepIndex: 3,
        targetSelector: '#quick-actions-grid',
        placement: StepPlacement.TOP,
        requiredAction: StepAction.NONE,
        backdropConfig: { dimOpacity: 0.6, blur: 2, clickThrough: false },
        advanceOnSelectorClick: false,
        i18n: {
          en: {
            title: 'Instant e-Services',
            content: 'Access certified digital documents, online tax payments, and appointment scheduling with 1 click.',
            nextBtn: 'Next',
            backBtn: 'Back',
            skipBtn: 'Skip',
          },
          am: {
            title: 'ፈጣን የኢንተርኔት አገልግሎቶች',
            content: 'የተረጋገጡ ዲጂታል ሰነዶችን፣ የመስመር ላይ የታክስ ክፍያዎችን እና የቀጠሮ መያዣን በአንድ ጠቅታ ያግኙ።',
            nextBtn: 'ቀጣይ',
            backBtn: 'ተመለስ',
            skipBtn: 'ዝለል',
          },
          om: {
            title: 'Tajaajiloota Dijitaalaa Ariifataa',
            content: 'Waraqaalee ragaa mirkanaa\'an, kaffaltii gibiraa toora interneetii fi beellama qabachuu cuqaasa tokkoon argadhaa.',
            nextBtn: 'Itti Aana',
            backBtn: 'Duubatti',
            skipBtn: 'Darbii',
          },
        },
      },
      {
        tourId: tour.id,
        stepIndex: 4,
        targetSelector: '#support-help-button',
        placement: StepPlacement.LEFT,
        requiredAction: StepAction.NONE,
        backdropConfig: { dimOpacity: 0.6, blur: 2, clickThrough: false },
        advanceOnSelectorClick: false,
        i18n: {
          en: {
            title: '24/7 Citizen Support',
            content: 'Need assistance? Chat with municipal representatives or restart this tour anytime from here.',
            nextBtn: 'Finish Tour 🎉',
            backBtn: 'Back',
            skipBtn: 'Close',
          },
          am: {
            title: 'የ24/7 የዜጎች ድጋፍ',
            content: 'እርዳታ ይፈልጋሉ? ከማዘጋጃ ቤት ተወካዮች ጋር ይወያዩ ወይም ይህንን ጉብኝት በማንኛውም ጊዜ እንደገና ያስጀምሩ።',
            nextBtn: 'ጉብኝቱን ጨርስ 🎉',
            backBtn: 'ተመለስ',
            skipBtn: 'ዝጋ',
          },
          om: {
            title: 'Deeggarsa Lammiilee 24/7',
            content: 'Gargaarsa barbaadduu? Bakka bu\'oota magaalaa wajjin mari\'adhaa ykn daawwannaa kana yeroo barbaaddanitti asii deebisaa jalqabaa.',
            nextBtn: 'Daawwannaa Xumuri 🎉',
            backBtn: 'Duubatti',
            skipBtn: 'Cufi',
          },
        },
      },
    ],
  });
  console.log(`✓ 4 Localized Tour Steps created for tour: ${tour.slug}`);

  console.log('✅ Database seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
