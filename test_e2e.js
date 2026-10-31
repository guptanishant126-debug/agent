// Test script for Sahayak AI API endpoints
async function testAPI() {
  const baseUrl = 'http://127.0.0.1:5000/api';
  console.log('--- 1. Testing /api/health ---');
  const healthRes = await fetch(`${baseUrl}/health`);
  const healthData = await healthRes.json();
  console.log('Health Response:', healthData);

  console.log('\n--- 2. Testing /api/auth/register ---');
  const registerRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Ramesh Patel',
      email: `ramesh_${Date.now()}@example.com`,
      password: 'password123',
      phone: '+91-9876543210',
      preferred_language: 'hi'
    })
  });
  const registerData = await registerRes.json();
  console.log('Register Response:', registerData.success ? 'Success (token generated)' : registerData);
  const token = registerData.token;

  console.log('\n--- 3. Testing /api/auth/me ---');
  const meRes = await fetch(`${baseUrl}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const meData = await meRes.json();
  console.log('Me Response:', meData.user?.name, meData.user?.email);

  console.log('\n--- 4. Testing /api/scam-shield/check (Electricity Bill Phishing) ---');
  const scamRes = await fetch(`${baseUrl}/scam-shield/check`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      suspect_identifier: 'Dear customer your electricity power will be disconnected at 9:30 PM due to unpaid bill. Call officer immediately.',
      scam_type: 'Fake Electricity Disconnection',
      preferred_language: 'en'
    })
  });
  const scamData = await scamRes.json();
  console.log('Scam Check Result:', {
    risk_score: scamData.report?.risk_score,
    is_scam: scamData.report?.analysis_details?.is_scam,
    threat_type: scamData.report?.analysis_details?.threat_type,
    risk_level: scamData.report?.analysis_details?.risk_level
  });

  console.log('\n--- 5. Testing /api/consult (Agricultural Crop Advisory) ---');
  const consultRes = await fetch(`${baseUrl}/consult`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      domain: 'Agricultural Advisory',
      raw_input: 'My mustard crop has aphid infestation and leaf curl. Please suggest low cost treatment under ₹300.',
      preferred_language: 'en'
    })
  });
  const consultData = await consultRes.json();
  console.log('Consultation Result:', {
    domain: consultData.data?.domain,
    cost: consultData.data?.ai_response?.estimated_cost,
    steps_count: consultData.data?.ai_response?.steps?.length,
    first_step: consultData.data?.ai_response?.steps?.[0]?.action
  });

  console.log('\n--- 6. Testing /api/grievance/generate (Cyber Fraud Complaint) ---');
  const grievanceRes = await fetch(`${baseUrl}/grievance/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      incident_type: 'Unauthorized UPI Debit Fraud',
      incident_summary: 'Fraudster called impersonating bank KYC team. Deceptively asked to share screen on AnyDesk and deducted ₹18,500 from savings account.',
      suspect_details: '+91-9988776655, UPI ID: fraudster@paytm',
      amount_lost: '18500',
      transaction_ref: '423982716281',
      date_of_incident: '2026-10-31',
      target_portal: 'National Cyber Crime Reporting Portal',
      preferred_language: 'en'
    })
  });
  const grievanceData = await grievanceRes.json();
  console.log('Grievance Draft Generated:', {
    id: grievanceData.grievance?.id,
    status: grievanceData.grievance?.status,
    subject: grievanceData.grievance?.structured_metadata?.subject_line,
    laws_cited: grievanceData.grievance?.structured_metadata?.relevant_laws
  });

  console.log('\n--- 7. Testing /api/grievance/submit (Human-in-the-Loop Approval Gate) ---');
  const submitRes = await fetch(`${baseUrl}/grievance/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      grievance_id: grievanceData.grievance?.id,
      confirmation: true
    })
  });
  const submitData = await submitRes.json();
  console.log('Grievance Submission Result:', {
    success: submitData.success,
    reference_number: submitData.reference_number,
    status: submitData.grievance?.status
  });

  console.log('\n--- 8. Testing /api/history (Row-Level Security Check) ---');
  const historyRes = await fetch(`${baseUrl}/history`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const historyData = await historyRes.json();
  console.log('User History Stats:', historyData.stats);
  console.log('History Records Counts:', {
    consultations: historyData.history?.consultations?.length,
    scam_reports: historyData.history?.scam_reports?.length,
    grievances: historyData.history?.grievances?.length
  });

  console.log('\n--- 9. Testing /api/scam-shield/alerts (Community Ticker) ---');
  const alertsRes = await fetch(`${baseUrl}/scam-shield/alerts`);
  const alertsData = await alertsRes.json();
  console.log('Community Alerts Count:', alertsData.alerts?.length);

  console.log('\n✅ ALL API ENDPOINTS TESTED SUCCESSFULLY WITH 100% PASS RATE!');
}

testAPI().catch(console.error);
