const http = require('http');
const { io } = require('socket.io-client');

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

const assert = (condition, message) => {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
};

const runAllTests = async () => {
  console.log('\n===============================================================');
  console.log('   QUEUECARE DEEP VERIFICATION & REGRESSION TEST SUITE');
  console.log('===============================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  const test = async (name, fn) => {
    try {
      console.log(`▶ Testing: ${name}`);
      await fn();
      passedCount++;
      console.log(`✅ PASSED: ${name}\n`);
    } catch (err) {
      failedCount++;
      console.error(`❌ FAILED: ${name}`);
      console.error(`   Error: ${err.message}\n`);
    }
  };

  // Test 1: Frontend & Backend Health & MongoDB Connectivity
  await test('1. Backend Server & MongoDB Connectivity', async () => {
    const res = await request('/health');
    assert(res.status === 200, 'Health endpoint responds with 200');
    assert(res.body.status === 'healthy', 'Health status is "healthy"');
  });

  // Test 2: Patient Registration & Login
  let patientToken, patientUser;
  const uniqueEmail = `test.verify.${Date.now()}@example.com`;
  await test('2. Patient Registration & Login', async () => {
    const regRes = await request('/auth/register', 'POST', {
      name: 'Verification Patient',
      email: uniqueEmail,
      password: 'password123',
      phone: '+1 555-010-9999',
      gender: 'Female',
      bloodGroup: 'A+',
    });
    assert(regRes.status === 201, 'Patient registration returns 201');
    assert(regRes.body.data?.token, 'JWT token returned on registration');
    assert(regRes.body.data?.user?.role === 'patient', 'Registered role is "patient"');

    // Login with same credentials
    const loginRes = await request('/auth/login', 'POST', {
      email: uniqueEmail,
      password: 'password123',
    });
    assert(loginRes.status === 200, 'Patient login returns 200');
    patientToken = loginRes.body.data.token;
    patientUser = loginRes.body.data.user;

    // Bad password check
    const badLogin = await request('/auth/login', 'POST', {
      email: uniqueEmail,
      password: 'wrong_password',
    });
    assert(badLogin.status === 401, 'Invalid password returns 401');
  });

  // Test 3: Doctor & Admin Authentication
  let doctorToken, doctorUser, doctorId;
  let adminToken, adminUser;
  await test('3. Doctor & Admin Authentication', async () => {
    // Doctor login
    const docLogin = await request('/auth/login', 'POST', {
      email: 'doctor.sarah@queuecare.com',
      password: 'doctor123',
    });
    assert(docLogin.status === 200, 'Doctor login returns 200');
    assert(docLogin.body.data.user.role === 'doctor', 'Role is "doctor"');
    doctorToken = docLogin.body.data.token;
    doctorUser = docLogin.body.data.user;
    doctorId = doctorUser.doctorProfile?._id;

    // Admin login
    const admLogin = await request('/auth/login', 'POST', {
      email: 'admin@queuecare.com',
      password: 'admin123',
    });
    assert(admLogin.status === 200, 'Admin login returns 200');
    assert(admLogin.body.data.user.role === 'admin', 'Role is "admin"');
    adminToken = admLogin.body.data.token;
    adminUser = admLogin.body.data.user;
  });

  // Test 4: Role-Based Route Protection
  await test('4. Role-Based Route Protection (RBAC)', async () => {
    // Unauthenticated request to protected route
    const unauth = await request('/admin/stats');
    assert(unauth.status === 401, 'Unauthenticated request to admin route returns 401');

    // Patient attempting admin route
    const patientAdmin = await request('/admin/stats', 'GET', null, patientToken);
    assert(patientAdmin.status === 403, 'Patient accessing admin route returns 403 Forbidden');

    // Doctor attempting admin route
    const docAdmin = await request('/admin/stats', 'GET', null, doctorToken);
    assert(docAdmin.status === 403, 'Doctor accessing admin route returns 403 Forbidden');

    // Admin accessing admin route
    const admAccess = await request('/admin/stats', 'GET', null, adminToken);
    assert(admAccess.status === 200, 'Admin accessing admin route returns 200 OK');

    // Patient attempting doctor-only queue call
    const patCall = await request('/queue/call-next', 'POST', null, patientToken);
    assert(patCall.status === 403, 'Patient calling queue returns 403 Forbidden');
  });

  // Test 5: Appointment Booking, Slot Duplication Prevention, and Cancellation
  let testAppId, testAppPin;
  await test('5. Appointment Booking, Double-Booking Prevention & Cancellation', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    // Book valid appointment
    const bookRes = await request(
      '/appointments',
      'POST',
      {
        doctorId,
        appointmentDate: dateStr,
        timeSlot: '11:00 AM',
        reason: 'Verification Consultation',
        symptoms: 'Mild knee discomfort',
      },
      patientToken
    );
    assert(bookRes.status === 201, 'Appointment booked successfully with 201');
    testAppId = bookRes.body.data.appointment._id;
    testAppPin = bookRes.body.data.appointment.checkInPin;
    assert(testAppPin && testAppPin.length === 4, '4-digit check-in PIN generated');
    assert(bookRes.body.data.appointment.qrCodeData, 'QR Code Data URL generated');

    // Double-booking check: try booking same doctor, same date, same slot
    const dupRes = await request(
      '/appointments',
      'POST',
      {
        doctorId,
        appointmentDate: dateStr,
        timeSlot: '11:00 AM',
        reason: 'Duplicate slot attempt',
      },
      patientToken
    );
    assert(dupRes.status === 400, 'Duplicate slot booking correctly rejected with 400');

    // Cancel appointment
    const cancelRes = await request(
      `/appointments/${testAppId}/cancel`,
      'PUT',
      { reason: 'User rescheduled' },
      patientToken
    );
    assert(cancelRes.status === 200, 'Appointment cancellation succeeds with 200');
    assert(cancelRes.body.data.appointment.status === 'cancelled', 'Status set to cancelled');

    // Attempting to cancel again
    const cancelAgain = await request(
      `/appointments/${testAppId}/cancel`,
      'PUT',
      {},
      patientToken
    );
    assert(cancelAgain.status === 400, 'Cannot cancel already cancelled appointment (400)');
  });

  // Test 6: Digital Token Generation & Uniqueness
  let checkInAppId, checkInTokenNumber;
  await test('6. Digital Token Generation, Sequence & Duplicate Prevention', async () => {
    const todayStr = new Date().toISOString().split('T')[0];

    // Book today appointment
    const todayBook = await request(
      '/appointments',
      'POST',
      {
        doctorId,
        appointmentDate: todayStr,
        timeSlot: '05:30 PM',
        reason: 'Token test visit',
      },
      patientToken
    );
    assert(todayBook.status === 201, 'Today appointment booked');
    checkInAppId = todayBook.body.data.appointment._id;
    const pin = todayBook.body.data.appointment.checkInPin;

    // Check in patient
    const checkInRes = await request(
      `/appointments/${checkInAppId}/checkin`,
      'POST',
      null,
      patientToken
    );
    assert(checkInRes.status === 200, 'Check-in returns 200');
    checkInTokenNumber = checkInRes.body.data.tokenNumber;
    assert(checkInTokenNumber.startsWith('CARD-'), 'Token formatted with department prefix CARD-');

    // Duplicate check-in prevention: checking in a second time
    const checkInSecond = await request(
      `/appointments/${checkInAppId}/checkin`,
      'POST',
      null,
      patientToken
    );
    assert(checkInSecond.status === 200, 'Second check-in handled safely');
    assert(checkInSecond.body.data.alreadyCheckedIn === true, 'alreadyCheckedIn flag returned');
    assert(checkInSecond.body.data.appointment.tokenNumber === checkInTokenNumber, 'Token number remains identical');
  });

  // Test 7: QR Check-In & PIN Verification
  await test('7. QR Check-In & 4-Digit PIN Verification', async () => {
    // Book another today appointment to test QR endpoint
    const todayStr = new Date().toISOString().split('T')[0];
    const appRes = await request(
      '/appointments',
      'POST',
      {
        doctorId,
        appointmentDate: todayStr,
        timeSlot: '06:00 PM',
        reason: 'QR check-in test',
      },
      patientToken
    );
    const appId = appRes.body.data.appointment._id;
    const validPin = appRes.body.data.appointment.checkInPin;

    // Test with invalid PIN
    const badPinRes = await request('/appointments/qr-checkin', 'POST', {
      appointmentId: appId,
      pin: '0000',
    });
    assert(badPinRes.status === 400, 'Wrong PIN rejected with 400');

    // Test with QR payload
    const qrPayload = JSON.stringify({ appId, pin: validPin, timestamp: Date.now() });
    const qrCheckIn = await request('/appointments/qr-checkin', 'POST', {
      qrData: qrPayload,
    });
    assert(qrCheckIn.status === 200, 'Check-in via QR payload verified with 200');
    assert(qrCheckIn.body.data.tokenNumber, 'Token generated via QR payload');
  });

  // Test 8: Live Real-Time Queue via Socket.IO
  await test('8. Real-Time Queue Updates via Socket.IO', async () => {
    const socket = io('http://127.0.0.1:5000', { transports: ['websocket'] });

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Socket.IO connection timeout')), 4000);

      socket.on('connect', () => {
        clearTimeout(timeout);
        assert(socket.connected, 'Socket.IO connected to backend');
        socket.emit('join_doctor_queue', doctorId);
        resolve();
      });
    });

    let queueUpdateReceived = false;
    socket.on('queue_updated', (queueData) => {
      queueUpdateReceived = true;
    });

    // Doctor calls next patient to trigger real-time broadcast
    const callRes = await request('/queue/call-next', 'POST', null, doctorToken);
    assert(callRes.status === 200, 'Doctor called patient');

    // Wait briefly for socket broadcast event
    await new Promise((resolve) => setTimeout(resolve, 800));
    assert(queueUpdateReceived === true, 'Socket.IO client received queue_updated broadcast');

    socket.disconnect();
  });

  // Test 9: Doctor Workflow (Call, Start, Skip, Complete Consultation)
  await test('9. Doctor Workflow: Call, Start, Skip & Complete Consultation', async () => {
    // 1. Check queue state
    const qState = await request(`/queue/doctor/${doctorId}`);
    const waitingToken = qState.body.data.queue.tokens.find((t) => t.status === 'waiting');
    assert(waitingToken, 'Found waiting patient in queue');

    // 2. Doctor calls specific token
    const callRes = await request('/queue/call-next', 'POST', { tokenId: waitingToken._id }, doctorToken);
    assert(callRes.status === 200, 'Doctor called token');
    assert(callRes.body.data.token.status === 'calling', 'Token status is "calling"');

    // 3. Doctor starts consultation
    const startRes = await request(
      `/queue/start-consultation/${waitingToken._id}`,
      'POST',
      null,
      doctorToken
    );
    assert(startRes.status === 200, 'Consultation started with 200');
    assert(startRes.body.data.token.status === 'in_consultation', 'Token status is "in_consultation"');

    // 4. Doctor completes consultation
    const compRes = await request(
      `/queue/complete/${waitingToken._id}`,
      'POST',
      {
        prescription: 'Verified Antibiotics 500mg BD x 5 days',
        notes: 'Patient recovery progressing well. Follow up in 2 weeks.',
      },
      doctorToken
    );
    assert(compRes.status === 200, 'Consultation completed with 200');
    assert(compRes.body.data.token.status === 'completed', 'Token status is "completed"');

    // 5. Test Skipping a patient
    const qState2 = await request(`/queue/doctor/${doctorId}`);
    const nextWaiting = qState2.body.data.queue.tokens.find((t) => t.status === 'waiting');
    if (nextWaiting) {
      const skipRes = await request(
        `/queue/skip/${nextWaiting._id}`,
        'POST',
        { reason: 'Patient did not arrive at door when called' },
        doctorToken
      );
      assert(skipRes.status === 200, 'Patient skipped successfully');
      assert(skipRes.body.data.token.status === 'skipped', 'Token status is "skipped"');
    }
  });

  // Test 10: Dynamic Waiting Time & Position Calculations
  await test('10. Dynamic Position & Estimated Waiting Time Metrics', async () => {
    const qRes = await request(`/queue/doctor/${doctorId}`);
    const queue = qRes.body.data.queue;
    const tokens = queue.tokens;

    const waitingTokens = tokens.filter((t) => t.status === 'waiting');
    if (waitingTokens.length >= 2) {
      assert(
        waitingTokens[1].patientsAhead > waitingTokens[0].patientsAhead,
        'Second waiting patient has more patients ahead than first'
      );
      assert(
        waitingTokens[1].estimatedWaitMinutes >= waitingTokens[0].estimatedWaitMinutes,
        'Estimated wait minutes scales with patients ahead'
      );
    }
  });

  // Test 11: Admin CRUD Operations
  await test('11. Admin CRUD Operations (Doctors, Departments, Clinic Settings)', async () => {
    // 1. Create Department
    const newDeptCode = `TST${Math.floor(Math.random() * 899 + 100)}`;
    const createDept = await request(
      '/departments',
      'POST',
      {
        name: `Test Specialty ${newDeptCode}`,
        code: newDeptCode,
        tokenPrefix: 'TST',
        description: 'Test Department Scope',
      },
      adminToken
    );
    assert(createDept.status === 201, 'Admin created department with 201');
    const deptId = createDept.body.data.department._id;

    // 2. Update Department
    const updateDept = await request(
      `/departments/${deptId}`,
      'PUT',
      { description: 'Updated Department Scope Description' },
      adminToken
    );
    assert(updateDept.status === 200, 'Admin updated department with 200');

    // 3. Create Doctor
    const docEmail = `admin_created_doc_${Date.now()}@queuecare.com`;
    const createDoc = await request(
      '/admin/doctors',
      'POST',
      {
        name: 'Dr. Admin Created',
        email: docEmail,
        password: 'doctor123',
        departmentId: deptId,
        specialization: 'Test General Medicine',
        roomNumber: '505',
        consultationFee: 70,
        avgConsultationMinutes: 15,
      },
      adminToken
    );
    assert(createDoc.status === 201, 'Admin created doctor with 201');
    const newDocId = createDoc.body.data.doctor._id;

    // 4. Update Doctor
    const updateDoc = await request(
      `/admin/doctors/${newDocId}`,
      'PUT',
      { roomNumber: '506 - East Wing', consultationFee: 80 },
      adminToken
    );
    assert(updateDoc.status === 200, 'Admin updated doctor with 200');

    // 5. Deactivate Doctor
    const delDoc = await request(`/admin/doctors/${newDocId}`, 'DELETE', null, adminToken);
    assert(delDoc.status === 200, 'Admin deactivated doctor with 200');

    // 6. Update Clinic Settings
    const updateClinic = await request(
      '/clinic',
      'PUT',
      {
        tagline: 'Healthcare Without the Waiting Room - Verified',
        slotDurationMinutes: 20,
      },
      adminToken
    );
    assert(updateClinic.status === 200, 'Admin updated clinic settings with 200');

    // 7. Get All Patients
    const pats = await request('/admin/patients', 'GET', null, adminToken);
    assert(pats.status === 200, 'Admin retrieved patient directory with 200');

    // 8. Get All Queues
    const allQueues = await request('/admin/queues', 'GET', null, adminToken);
    assert(allQueues.status === 200, 'Admin retrieved all queues with 200');
  });

  console.log('===============================================================');
  console.log(`   TEST RUN COMPLETE: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('===============================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

runAllTests();
