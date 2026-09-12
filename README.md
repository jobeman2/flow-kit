# Flow-Kit

> **Developer-First Onboarding & Universal Spotlight Walkthrough Platform**
> Interactive product tours, visual spotlight guides, and multilingual tooltips with just 2 lines of code.

---

## Highlights

- **2-Line Drop-In SDK**: Integrate full product walkthroughs via standalone script tag or React components in seconds.
- **Dynamic Spotlight Engine**: SVG cutout masks with collision detection, smooth transitions, and smart auto-scrolling.
- **Multilingual-First**: Native multi-locale copy studio supporting English, Amharic (አማርኛ), Afaan Oromoo, and customizable locales.
- **Visual Element Inspector**: Point-and-click browser inspector to capture CSS selectors directly from your web app.
- **Enterprise SaaS Dashboard**: Clean modern SaaS interface built with Next.js 14, Tailwind CSS, DM Sans typography, and Clerk authentication.
- **Telemetry & Funnel Analytics**: Track start rates, drop-off per step, and tour completion in real time.
- **Zero-Friction Auto-Provisioning**: Automatic workspace, project, and cryptographic API key provisioning on first login.

---

## Architecture

Flow-Kit is organized as a high-performance monorepo managed with **Turborepo** and **pnpm**:

`
flow-kit/
├── apps/
│   ├── api/             # NestJS backend (Prisma, PostgreSQL, Redis, REST API)
│   ├── dashboard/       # Next.js 14 management console (Clerk Auth, Studio, Analytics)
│   └── demo-app/        # Vite citizen portal demonstration application
├── packages/
│   ├── sdk-web/         # Zero-dependency browser SDK (@flow-kit/web)
│   ├── sdk-react/       # Declarative React bindings (@flow-kit/react)
│   └── database/        # Prisma schema, migrations, and PostgreSQL models
├── .github/workflows/   # Automated CI pipeline
└── docker-compose.yml   # Multi-service container deployment
`

---

## Quick Start

### 1. Local Development

Ensure you have **Node.js 20+** and **pnpm 11+** installed:

`ash
# Clone the repository
git clone https://github.com/jobeman2/flow-kit.git
cd flow-kit

# Install dependencies
pnpm install

# Configure environment variables
cp .env.example .env

# Generate Prisma Client
pnpm db:generate

# Build all packages
pnpm build

# Start all services concurrently
pnpm dev
`

Default service URLs:
- **Dashboard**: http://localhost:3001
- **API Server**: http://localhost:4000
- **Demo App**: http://localhost:5173
- **Universal SDK Script**: http://localhost:4000/flow-kit.js

---

### 2. Docker Compose

Run the entire platform (PostgreSQL, Redis, API, and Dashboard) with a single command:

`ash
docker compose up --build
`

---

## Client SDK Integration

### Option A: 2-Line HTML / CDN Drop-In

Paste into any HTML or web application before the closing </body> tag:

`html
<script
  src="http://localhost:4000/flow-kit.js"
  data-api-key="YOUR_PUBLIC_CLIENT_KEY"
  data-locale="en"
></script>
`

To switch languages dynamically:
`javascript
window.flowKitInstance.setLocale('am'); // Switches to Amharic
window.flowKitInstance.setLocale('om'); // Switches to Afaan Oromoo
window.flowKitInstance.setLocale('en'); // Switches to English
`

To trigger a tour manually:
`javascript
window.flowKitInstance.startTour('welcome-walkthrough');
`

---

### Option B: React / Next.js

Install the React package:

`ash
npm install @flow-kit/react
`

Wrap your application root in <FlowKitProvider>:

`	sx
import { FlowKitProvider, TourTriggerButton } from '@flow-kit/react';

export default function App() {
  return (
    <FlowKitProvider apiKey="pk_live_your_key" apiUrl="http://localhost:4000">
      <YourAppComponents />
      
      {/* Declarative button to trigger any tour */}
      <TourTriggerButton tourSlug="welcome-walkthrough">
        Take Product Tour
      </TourTriggerButton>
    </FlowKitProvider>
  );
}
`

---

## Visual Element Inspector

When building tour steps in the Dashboard, click **Point & Click Inspector** to launch Flow-Kit's live selector capture tool on your web application.

1. Copy the generated inspector snippet from the Tour Studio.
2. Open your web app and paste the snippet in the Browser DevTools Console (F12).
3. Hover over any button or input to highlight it, then click to copy its optimal CSS selector straight to your clipboard.

---

## Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| DATABASE_URL | PostgreSQL connection string | postgresql://postgres:password123@localhost:5432/flowkit?schema=public |
| REDIS_HOST | Redis host (in-memory fallback enabled if absent) | localhost |
| REDIS_PORT | Redis port | 6379 |
| API_PORT | Port for the NestJS API server | 4000 |
| NEXT_PUBLIC_API_URL | API URL accessed by dashboard | http://localhost:4000 |
| NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY | Clerk authentication publishable key | (Your Clerk Publishable Key) |
| CLERK_SECRET_KEY | Clerk backend secret key | (Your Clerk Secret Key) |

---

## Verification & Testing

Run the full end-to-end automated system verification:

`ash
node verify-e2e.js
`

Runs 20 automated assertions covering:
- CDN SDK delivery (low-kit.js and /sdk.js legacy alias)
- Public tour resolution & step order
- Multilingual step localization (English, Amharic, Oromoo)
- Batch telemetry event ingestion
- Real-time funnel analytics computation
- New user auto-provisioning & workspace initialization

---

## License

MIT © [Flow-Kit](https://github.com/jobeman2/flow-kit)
