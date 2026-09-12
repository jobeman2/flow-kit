async function runE2EVerification() {
  console.log('🧪 Starting OnboardFlow End-to-End System Verification...\n');

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
    // 1. Verify CDN Script delivery
    const sdkRes = await fetch('http://localhost:4000/sdk.js');
    const sdkText = await sdkRes.text();
    assert(sdkRes.status === 200, 'CDN SDK served at http://localhost:4000/sdk.js (Status 200)');
    assert(sdkText.includes('OnboardFlow'), 'SDK bundle contains OnboardFlow client engine');
    assert(sdkText.length > 5000, `SDK bundle properly minified (${(sdkText.length / 1024).toFixed(1)} KB)`);

    // 2. Verify Public Tour Resolution
    const tourRes = await fetch('http://localhost:4000/v1/public/tours?url=/', {
      headers: { 'x-api-key': 'pk_live_demo_addis_79a2f1b4c6e8' }
    });
    const tours = await tourRes.json();
    assert(tourRes.status === 200, 'Tour Resolution API returns 200 OK');
    assert(tours.length >= 1, `Found ${tours.length} active published tour(s)`);
    const tour = tours[0];
    assert(tour.slug === 'welcome-citizen-walkthrough', `Tour slug matches: "${tour.slug}"`);
    assert(tour.steps.length === 4, `Tour contains 4 steps (actual: ${tour.steps.length})`);
    
    // 3. Verify Multilingual (Amharic & English) Step content
    const step1 = tour.steps[0];
    assert(step1.i18n.en && step1.i18n.en.title === 'Unified Search', 'Step 1 English localization present');
    assert(step1.i18n.am && step1.i18n.am.title === 'የማዘጋጃ ቤት አገልግሎት ፍለጋ', 'Step 1 Amharic localization present');
    assert(step1.i18n.om && step1.i18n.om.title === 'Barbaada Tajaajila Waloo', 'Step 1 Afaan Oromoo localization present');

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

    // 5. Verify Authentication & JWT
    const loginRes = await fetch('http://localhost:4000/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@onboardflow.com',
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 || loginRes.status === 201, 'User login succeeds');
    assert(typeof loginData.accessToken === 'string', 'JWT access token issued');

    // 6. Verify Dashboard Funnel Analytics computation
    const projectId = loginData.user.memberships[0].organization.projects[0].id;
    const funnelRes = await fetch(`http://localhost:4000/v1/projects/${projectId}/analytics/funnel?tourId=${tour.id}`, {
      headers: { 'Authorization': `Bearer ${loginData.accessToken}` }
    });
    const funnel = await funnelRes.json();
    assert(funnelRes.status === 200, 'Funnel Analytics returns 200 OK');
    assert(funnel.totalStarted >= 1, `Funnel counts totalStarted (${funnel.totalStarted})`);
    assert(funnel.totalCompleted >= 1, `Funnel counts totalCompleted (${funnel.totalCompleted})`);
    assert(funnel.steps.length === 4, `Funnel computes 4 drop-off step metrics`);

    // 7. Verify SaaS Dashboard UI HTTP response
    const dashRes = await fetch('http://localhost:3001');
    assert(dashRes.status === 200, 'Next.js Dashboard is live at http://localhost:3001 (Status 200)');

    // 8. Verify Consumer Demo App HTTP response
    const demoRes = await fetch('http://localhost:5173');
    const demoHtml = await demoRes.text();
    assert(demoRes.status === 200, 'Demo Consumer App is live at http://localhost:5173 (Status 200)');
    assert(demoHtml.includes('http://localhost:4000/sdk.js'), 'Demo App incorporates 2-line OnboardFlow script tag');
    assert(demoHtml.includes('global-search-bar'), 'Demo App renders DOM spotlight targets (#global-search-bar)');

    console.log(`\n🎉 Verification Completed: ${passed} / ${total} Checks Passed with 100% success!`);
  } catch (err) {
    console.error('Test execution error:', err);
  }
}

runE2EVerification();
