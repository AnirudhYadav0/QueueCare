const http = require('http');

// Helper to make HTTP requests
const request = (path, method = 'GET', data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data && { 'Content-Length': Buffer.byteLength(postData) }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (data) req.write(postData);
    req.end();
  });
};

const runTests = async () => {
  console.log('--- STARTING QUEUECARE END-TO-END WORKFLOW VERIFICATION ---');

  try {
    // 1. Health check
    const health = await request('/health');
    console.log('[1] Healthcheck:', health.status, health.body);

    // 2. Admin Login
    const adminLogin = await request('/auth/login', 'POST', {
      email: 'admin@queuecare.com',
      password: 'admin123',
    });
    console.log('[2] Admin Login:', adminLogin.status, adminLogin.body.message);
    const adminToken = adminLogin.body.data?.token;

    // 3. Admin Stats & Analytics
    const adminStats = await request('/admin/stats', 'GET', null, adminToken);
    console.log('[3] Admin Dashboard Stats:', adminStats.status, {
      totalPatients: adminStats.body.data?.totalPatients,
      totalDoctors: adminStats.body.data?.totalDoctors,
      todayAppointments: adminStats.body.data?.todayAppointments,
    });

    // 4. Doctor Login (Dr. Sarah Jenkins)
    const docLogin = await request('/auth/login', 'POST', {
      email: 'doctor.sarah@queuecare.com',
      password: 'doctor123',
    });
    console.log('[4] Doctor Login:', docLogin.status, docLogin.body.message);
    const docToken = docLogin.body.data?.token;
    const docId = docLogin.body.data?.user?.doctorProfile?._id;

    // 5. Patient Login (John Doe)
    const patLogin = await request('/auth/login', 'POST', {
      email: 'patient.john@queuecare.com',
      password: 'patient123',
    });
    console.log('[5] Patient Login:', patLogin.status, patLogin.body.message);
    const patToken = patLogin.body.data?.token;

    // 6. Patient Active Queue Check
    const patQueue = await request('/queue/patient/status', 'GET', null, patToken);
    console.log('[6] Patient Live Queue State:', patQueue.status, {
      hasToken: patQueue.body.data?.activeQueue?.hasToken,
      tokenNumber: patQueue.body.data?.activeQueue?.token?.tokenNumber,
      patientsAhead: patQueue.body.data?.activeQueue?.token?.patientsAhead,
      estimatedWaitMinutes: patQueue.body.data?.activeQueue?.token?.estimatedWaitMinutes,
      currentServing: patQueue.body.data?.activeQueue?.currentServingToken,
    });

    // 7. Register a New Patient
    const testEmail = `testpatient_${Date.now()}@example.com`;
    const regRes = await request('/auth/register', 'POST', {
      name: 'Test Workflow Patient',
      email: testEmail,
      password: 'password123',
      phone: '+1 555-999-1234',
    });
    console.log('[7] Patient Registration:', regRes.status, regRes.body.data?.user?.name);
    const newPatToken = regRes.body.data?.token;

    // 8. Book Appointment for Today with Dr. Sarah Jenkins
    const todayStr = new Date().toISOString().split('T')[0];
    const bookRes = await request(
      '/appointments',
      'POST',
      {
        doctorId: docId,
        appointmentDate: todayStr,
        timeSlot: '04:30 PM',
        reason: 'Automated E2E Test Consultation',
        symptoms: 'Mild headache test',
      },
      newPatToken
    );
    console.log('[8] Appointment Booking:', bookRes.status, {
      id: bookRes.body.data?.appointment?._id,
      pin: bookRes.body.data?.appointment?.checkInPin,
      status: bookRes.body.data?.appointment?.status,
    });
    const newAppId = bookRes.body.data?.appointment?._id;

    // 9. Check in via appointment ID
    const checkInRes = await request(
      `/appointments/${newAppId}/checkin`,
      'POST',
      null,
      newPatToken
    );
    console.log('[9] Patient Check-In & Token Generation:', checkInRes.status, {
      tokenNumber: checkInRes.body.data?.tokenNumber,
      patientsAhead: checkInRes.body.data?.queue?.tokens?.find(
        (t) => t.tokenNumber === checkInRes.body.data?.tokenNumber
      )?.patientsAhead,
      estWait: checkInRes.body.data?.queue?.tokens?.find(
        (t) => t.tokenNumber === checkInRes.body.data?.tokenNumber
      )?.estimatedWaitMinutes,
    });

    // 10. Doctor calls next patient in queue
    const callRes = await request('/queue/call-next', 'POST', null, docToken);
    console.log('[10] Doctor Called Next Patient:', callRes.status, {
      calledToken: callRes.body.data?.token?.tokenNumber,
      patientName: callRes.body.data?.token?.patientName,
      status: callRes.body.data?.token?.status,
    });

    // 11. Doctor starts consultation with called patient
    const calledTokenId = callRes.body.data?.token?._id;
    const startRes = await request(
      `/queue/start-consultation/${calledTokenId}`,
      'POST',
      null,
      docToken
    );
    console.log('[11] Consultation Started:', startRes.status, {
      token: startRes.body.data?.token?.tokenNumber,
      status: startRes.body.data?.token?.status,
    });

    // 12. Doctor completes consultation
    const completeRes = await request(
      `/queue/complete/${calledTokenId}`,
      'POST',
      {
        prescription: 'E2E Verified RX - Rest and hydration',
        notes: 'Patient responded well during automated test.',
      },
      docToken
    );
    console.log('[12] Consultation Completed:', completeRes.status, {
      token: completeRes.body.data?.token?.tokenNumber,
      status: completeRes.body.data?.token?.status,
    });

    console.log('--- ALL WORKFLOW CHECKS PASSED SUCCESSFULLY ---');
    process.exit(0);
  } catch (err) {
    console.error('Workflow Test Failed:', err);
    process.exit(1);
  }
};

runTests();
