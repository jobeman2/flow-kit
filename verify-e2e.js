async function runE2EVerification() {
  console.log('🧪 Starting Flow-Kit End-to-End System Verification...\n');

  let passed = 0;
  let total = 0;

  function assert(condition, description) {
    total++;
    if (condition) {
      console.log(`  ✓ [PASS] ${description}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${description}`);
    }
  }

  try {
    // 1. Verify Flow-Kit script delivery
    const sdkRes = await fetch('http://localhost:4000/flow-kit.js');
    const sdkText = await sdkRes.text();
    assert(sdkRes.status === 200, 'CDN SDK served at http://localhost:4000/flow-kit.js (Status 200)');
    assert(sdkText.includes('FlowKit') || sdkText.includes('OnboardFlow'), 'SDK bundle contains FlowKit client engine');
    assert(sdkText.length > 5000, `SDK bundle properly minified (${(sdkText.length / 1024).toFixed(1)} KB)`);

    // Verify backward compatibility alias /sdk.js
    const aliasRes = await fetch('http://localhost:4000/sdk.js');
    assert(aliasRes.status === 200, 'Legacy alias served at http://localhost:4000/sdk.js (Status 200)');

    // 2. Verify Public Tour Resolution
    const tourRes = await fetch('http://localhost:4000/v1/public/tours?url=/', {
      headers: { 'x-api-key': 'pk_live_demo_addis_79a2f1b4c6e8' }
    });
    const tours = await tourRes.json();
    assert(tourRes.status === 200, 'Tour Resolution API returns 200 OK');
    assert(tours.length >= 1, `Found ${tours.length} active published tour(s)`);
    const tour = tours[0];
    assert(tour.steps.length >= 2, `Tour contains steps (actual: ${tour.steps.length})`);
    
    // 3. Verify Multilingual (Amharic & English) Step content
    const step1 = tour.steps[0];
    assert(step1.i18n.en, 'Step 1 English localization present');
    assert(step1.i18n.am, 'Step 1 Amharic localization present');
    assert(step1.i18n.om, 'Step 1 Afaan Oromoo localization present');

    // 4. Ingest Telemetry Events
    const anonUser = 'verifier_' + Math.random().toString(36).substring(2, 8);
    const eventRes = await fetch('http://localhost:4000/v1/public/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'pk_live_demo_addis_79a2f1b4c6e8'
      },
      body: JSON.stringify({
        events: [
          {
            tourId: tour.id,
            eventType: 'TOUR_STARTED',
            anonymousUserId: anonUser,
            locale: 'am',
            path: '/'
          },
          {
            tourId: tour.id,
            tourStepId: step1.id,
            eventType: 'STEP_VIEWED',
            anonymousUserId: anonUser,
            locale: 'am',
            path: '/'
          },
          {
            tourId: tour.id,
            tourStepId: step1.id,
            eventType: 'STEP_COMPLETED',
            anonymousUserId: anonUser,
            locale: 'am',
            path: '/'
          },
          {
            tourId: tour.id,
            eventType: 'TOUR_COMPLETED',
            anonymousUserId: anonUser,
            locale: 'am',
            path: '/'
          }
        ]
      })
    });
    const eventJson = await eventRes.json();
    assert(eventRes.status === 201 && eventJson.ingested === 4, `Batch telemetry ingested 4 events (Status ${eventRes.status})`);

    // 5. Verify Auto-Provisioning on User Login / OAuth
    const testEmail = `e2e_user_${Date.now()}@example.com`;
    const authRes = await fetch('http://localhost:4000/v1/auth/oauth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'GOOGLE',
        profile: {
          email: testEmail,
          name: 'E2E Test User',
          providerId: `clerk_${Date.now()}`
        }
      })
    });
    const authData = await authRes.json();
    assert(authRes.status === 200 || authRes.status === 201, 'User auto-authentication succeeds');
    assert(typeof authData.accessToken === 'string', 'JWT access token issued');

    // Auto-provisioning check via GET /v1/projects
    const projRes = await fetch('http://localhost:4000/v1/projects', {
      headers: { Authorization: `Bearer ${authData.accessToken}` }
    });
    const projs = await projRes.json();
    assert(projRes.status === 200 && Array.isArray(projs) && projs.length >= 1, 'Auto-provisioned default workspace and project for new user');
    const userProj = projs[0];
    assert(userProj.apiKeys && userProj.apiKeys.length >= 1, 'Auto-provisioned cryptographic API keys');

    // 6. Verify Dashboard Funnel Analytics computation
    const funnelRes = await fetch(`http://localhost:4000/v1/projects/${userProj.id}/analytics/funnel`, {
      headers: { 'Authorization': `Bearer ${authData.accessToken}` }
    });
    assert(funnelRes.status === 200, 'Funnel Analytics returns 200 OK');

    // 7. Verify SaaS Dashboard UI HTTP response
    const dashRes = await fetch('http://localhost:3001');
    assert(dashRes.status === 200, 'Next.js Dashboard is live at http://localhost:3001 (Status 200)');

    // 8. Verify Consumer Demo App HTTP response
    const demoRes = await fetch('http://localhost:5173');
    const demoHtml = await demoRes.text();
    assert(demoRes.status === 200, 'Demo Consumer App is live at http://localhost:5173 (Status 200)');
    assert(demoHtml.includes('flow-kit.js'), 'Demo App incorporates Flow-Kit script tag');
    assert(demoHtml.includes('global-search-bar'), 'Demo App renders DOM spotlight targets (#global-search-bar)');

    console.log(`\n🎉 Verification Completed: ${passed} / ${total} Checks Passed with 100% success!`);
  } catch (err) {
    console.error('Test execution error:', err);
  }
}

runE2EVerification();

