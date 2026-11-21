const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Clinic = require('../models/Clinic');
const Department = require('../models/Department');
const Appointment = require('../models/Appointment');
const Queue = require('../models/Queue');
const Notification = require('../models/Notification');
const { generateQRCodeDataUrl } = require('../services/tokenService');
const { getTodayNormalized } = require('../services/queueEngine');

const seedDatabase = async () => {
  try {
    console.log('Clearing existing database collections...');
    await Promise.all([
      User.deleteMany({}),
      Doctor.deleteMany({}),
      Patient.deleteMany({}),
      Clinic.deleteMany({}),
      Department.deleteMany({}),
      Appointment.deleteMany({}),
      Queue.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log('Seeding Clinic...');
    const clinic = await Clinic.create({
      name: 'QueueCare Medical & Specialty Center',
      tagline: 'Healthcare Without the Waiting Room',
      address: '450 Health Avenue, Suite 100',
      city: 'Metro City',
      phone: '+1 (800) 555-CARE',
      email: 'contact@queuecare.health',
      operatingHours: {
        open: '08:00',
        close: '20:00',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      },
      slotDurationMinutes: 15,
    });

    console.log('Seeding Departments...');
    const departments = await Department.create([
      {
        name: 'Cardiology',
        code: 'CARD',
        tokenPrefix: 'CARD',
        description: 'Advanced cardiac care, ECGs, echocardiograms, and preventive cardiovascular health.',
        icon: 'HeartPulse',
        clinic: clinic._id,
      },
      {
        name: 'Pediatrics',
        code: 'PEDI',
        tokenPrefix: 'PEDI',
        description: 'Comprehensive infant, child, and adolescent primary care and development.',
        icon: 'Baby',
        clinic: clinic._id,
      },
      {
        name: 'Orthopedics',
        code: 'ORTH',
        tokenPrefix: 'ORTH',
        description: 'Musculoskeletal diagnostics, sports injuries, fracture recovery, and joint care.',
        icon: 'Activity',
        clinic: clinic._id,
      },
      {
        name: 'General Medicine',
        code: 'GEN',
        tokenPrefix: 'GEN',
        description: 'Routine wellness checks, acute illness assessment, and holistic health management.',
        icon: 'Stethoscope',
        clinic: clinic._id,
      },
    ]);

    const cardDept = departments[0];
    const pediDept = departments[1];
    const orthDept = departments[2];
    const genDept = departments[3];

    console.log('Seeding Admin...');
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@queuecare.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1 (555) 010-0001',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    });

    console.log('Seeding Doctors...');
    const doctorUsersData = [
      {
        name: 'Dr. Sarah Jenkins',
        email: 'doctor.sarah@queuecare.com',
        phone: '+1 (555) 012-3001',
        dept: cardDept,
        specialization: 'Senior Cardiologist & Interventional Specialist',
        qualification: 'MD, FACC, Harvard Medical School',
        roomNumber: '101 - West Wing',
        fee: 75,
        avgMins: 15,
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
      },
      {
        name: 'Dr. Marcus Chen',
        email: 'doctor.marcus@queuecare.com',
        phone: '+1 (555) 012-3002',
        dept: pediDept,
        specialization: 'Chief Pediatrician & Child Health Consultant',
        qualification: 'MD, FAAP, Johns Hopkins',
        roomNumber: '204 - East Wing',
        fee: 60,
        avgMins: 15,
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
      },
      {
        name: 'Dr. Elena Rostova',
        email: 'doctor.elena@queuecare.com',
        phone: '+1 (555) 012-3003',
        dept: orthDept,
        specialization: 'Orthopedic Surgeon & Sports Medicine',
        qualification: 'MD, MS (Ortho), Stanford Medicine',
        roomNumber: '302 - Surgical Wing',
        fee: 85,
        avgMins: 20,
        avatar: 'https://images.unsplash.com/photo-1594824813501-44755d4b5327?auto=format&fit=crop&q=80&w=300',
      },
      {
        name: 'Dr. James Wilson',
        email: 'doctor.james@queuecare.com',
        phone: '+1 (555) 012-3004',
        dept: genDept,
        specialization: 'Consultant Internal Medicine',
        qualification: 'MBBS, MD, Oxford Medical',
        roomNumber: '105 - Ground Floor',
        fee: 50,
        avgMins: 15,
        avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300',
      },
    ];

    const createdDoctors = [];
    for (const d of doctorUsersData) {
      const u = await User.create({
        name: d.name,
        email: d.email,
        password: 'doctor123',
        role: 'doctor',
        phone: d.phone,
        avatar: d.avatar,
      });

      const doc = await Doctor.create({
        user: u._id,
        department: d.dept._id,
        clinic: clinic._id,
        specialization: d.specialization,
        qualification: d.qualification,
        roomNumber: d.roomNumber,
        consultationFee: d.fee,
        avgConsultationMinutes: d.avgMins,
        isAvailable: true,
      });

      createdDoctors.push({ user: u, doctor: doc, dept: d.dept });
    }

    console.log('Seeding Patients...');
    const patientUsersData = [
      {
        name: 'John Doe',
        email: 'patient.john@queuecare.com',
        phone: '+1 (555) 019-9001',
        gender: 'Male',
        bloodGroup: 'O+',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      },
      {
        name: 'Emily Davis',
        email: 'emily.davis@example.com',
        phone: '+1 (555) 019-9002',
        gender: 'Female',
        bloodGroup: 'A+',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
      },
      {
        name: 'Michael Brown',
        email: 'michael.b@example.com',
        phone: '+1 (555) 019-9003',
        gender: 'Male',
        bloodGroup: 'B+',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      },
      {
        name: 'Sophia Patel',
        email: 'sophia.p@example.com',
        phone: '+1 (555) 019-9004',
        gender: 'Female',
        bloodGroup: 'AB+',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
      },
      {
        name: 'Robert Johnson',
        email: 'robert.j@example.com',
        phone: '+1 (555) 019-9005',
        gender: 'Male',
        bloodGroup: 'O-',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
      },
    ];

    const createdPatients = [];
    for (const p of patientUsersData) {
      const u = await User.create({
        name: p.name,
        email: p.email,
        password: 'patient123',
        role: 'patient',
        phone: p.phone,
        avatar: p.avatar,
      });

      const pat = await Patient.create({
        user: u._id,
        gender: p.gender,
        bloodGroup: p.bloodGroup,
        emergencyContact: {
          name: 'Next of Kin',
          phone: '+1 (555) 019-9999',
          relation: 'Family',
        },
      });

      createdPatients.push({ user: u, patient: pat });
    }

    console.log('Seeding Appointments and Live Queue...');
    const today = getTodayNormalized();
    const primaryDoctor = createdDoctors[0]; // Dr. Sarah Jenkins (Cardiology)

    // Appointments for today with Dr. Sarah Jenkins
    // 1. Emily Davis -> CARD-01 (Completed)
    // 2. Michael Brown -> CARD-02 (In Consultation)
    // 3. John Doe -> CARD-03 (Waiting, checked in!)
    // 4. Sophia Patel -> CARD-04 (Waiting, checked in!)
    // 5. Robert Johnson -> Scheduled (03:00 PM)

    const qrData1 = await generateQRCodeDataUrl('app1', '1234');
    const app1 = await Appointment.create({
      patient: createdPatients[1].user._id,
      doctor: primaryDoctor.doctor._id,
      department: cardDept._id,
      clinic: clinic._id,
      appointmentDate: today,
      timeSlot: '09:00 AM',
      reason: 'Routine ECG review & follow-up',
      status: 'completed',
      tokenNumber: 'CARD-01',
      tokenSequence: 1,
      checkInPin: '4120',
      qrCodeData: qrData1.qrDataUrl,
      checkInTime: new Date(Date.now() - 60 * 60 * 1000),
      consultationStartTime: new Date(Date.now() - 45 * 60 * 1000),
      consultationEndTime: new Date(Date.now() - 30 * 60 * 1000),
      notes: 'Blood pressure normal at 118/76. ECG sinus rhythm intact.',
      prescription: 'Aspirin 81mg daily. Re-check in 6 months.',
    });

    const qrData2 = await generateQRCodeDataUrl('app2', '5678');
    const app2 = await Appointment.create({
      patient: createdPatients[2].user._id,
      doctor: primaryDoctor.doctor._id,
      department: cardDept._id,
      clinic: clinic._id,
      appointmentDate: today,
      timeSlot: '09:30 AM',
      reason: 'Chest tightness evaluation',
      status: 'in_consultation',
      tokenNumber: 'CARD-02',
      tokenSequence: 2,
      checkInPin: '8231',
      qrCodeData: qrData2.qrDataUrl,
      checkInTime: new Date(Date.now() - 35 * 60 * 1000),
      consultationStartTime: new Date(Date.now() - 5 * 60 * 1000),
    });

    const qrData3 = await generateQRCodeDataUrl('app3', '9012');
    const app3 = await Appointment.create({
      patient: createdPatients[0].user._id, // John Doe
      doctor: primaryDoctor.doctor._id,
      department: cardDept._id,
      clinic: clinic._id,
      appointmentDate: today,
      timeSlot: '10:00 AM',
      reason: 'Heart palpitation assessment & stress test consultation',
      status: 'waiting',
      tokenNumber: 'CARD-03',
      tokenSequence: 3,
      checkInPin: '1984',
      qrCodeData: qrData3.qrDataUrl,
      checkInTime: new Date(Date.now() - 15 * 60 * 1000),
    });

    const qrData4 = await generateQRCodeDataUrl('app4', '3456');
    const app4 = await Appointment.create({
      patient: createdPatients[3].user._id, // Sophia Patel
      doctor: primaryDoctor.doctor._id,
      department: cardDept._id,
      clinic: clinic._id,
      appointmentDate: today,
      timeSlot: '10:30 AM',
      reason: 'Hypertension monitoring',
      status: 'waiting',
      tokenNumber: 'CARD-04',
      tokenSequence: 4,
      checkInPin: '6752',
      qrCodeData: qrData4.qrDataUrl,
      checkInTime: new Date(Date.now() - 8 * 60 * 1000),
    });

    const qrData5 = await generateQRCodeDataUrl('app5', '7890');
    const app5 = await Appointment.create({
      patient: createdPatients[4].user._id, // Robert Johnson
      doctor: primaryDoctor.doctor._id,
      department: cardDept._id,
      clinic: clinic._id,
      appointmentDate: today,
      timeSlot: '03:00 PM',
      reason: 'Cardiology general consultation',
      status: 'scheduled',
      checkInPin: '3341',
      qrCodeData: qrData5.qrDataUrl,
    });

    // Populate today's active Queue for Dr. Sarah Jenkins
    await Queue.create({
      doctor: primaryDoctor.doctor._id,
      department: cardDept._id,
      clinic: clinic._id,
      date: today,
      status: 'active',
      currentServingToken: 'CARD-02',
      currentServingSequence: 2,
      lastTokenSequence: 4,
      tokens: [
        {
          appointment: app1._id,
          patient: createdPatients[1].user._id,
          patientName: createdPatients[1].user.name,
          tokenNumber: 'CARD-01',
          sequence: 1,
          status: 'completed',
          checkInTime: new Date(Date.now() - 60 * 60 * 1000),
          consultationStartedAt: new Date(Date.now() - 45 * 60 * 1000),
          completedAt: new Date(Date.now() - 30 * 60 * 1000),
        },
        {
          appointment: app2._id,
          patient: createdPatients[2].user._id,
          patientName: createdPatients[2].user.name,
          tokenNumber: 'CARD-02',
          sequence: 2,
          status: 'in_consultation',
          checkInTime: new Date(Date.now() - 35 * 60 * 1000),
          calledAt: new Date(Date.now() - 10 * 60 * 1000),
          consultationStartedAt: new Date(Date.now() - 5 * 60 * 1000),
        },
        {
          appointment: app3._id,
          patient: createdPatients[0].user._id, // John Doe
          patientName: createdPatients[0].user.name,
          tokenNumber: 'CARD-03',
          sequence: 3,
          status: 'waiting',
          checkInTime: new Date(Date.now() - 15 * 60 * 1000),
        },
        {
          appointment: app4._id,
          patient: createdPatients[3].user._id, // Sophia Patel
          patientName: createdPatients[3].user.name,
          tokenNumber: 'CARD-04',
          sequence: 4,
          status: 'waiting',
          checkInTime: new Date(Date.now() - 8 * 60 * 1000),
        },
      ],
    });

    console.log('Seeding Sample Notifications...');
    await Notification.create([
      {
        recipient: createdPatients[0].user._id,
        title: 'Check-in Confirmed!',
        message: 'You are checked in for Dr. Sarah Jenkins. Your token is CARD-03. Please watch the queue board.',
        type: 'queue',
        relatedAppointment: app3._id,
        link: `/queue/${primaryDoctor.doctor._id}`,
        isRead: false,
      },
      {
        recipient: createdPatients[0].user._id,
        title: 'Appointment Confirmed',
        message: `Your appointment with Dr. Sarah Jenkins is confirmed for ${today.toLocaleDateString()} at 10:00 AM.`,
        type: 'appointment',
        relatedAppointment: app3._id,
        link: `/appointments/${app3._id}`,
        isRead: true,
      },
      {
        recipient: createdPatients[1].user._id,
        title: 'Consultation Complete',
        message: 'Your consultation with Dr. Sarah Jenkins is completed. View your prescription online.',
        type: 'appointment',
        relatedAppointment: app1._id,
        isRead: true,
      },
    ]);

    console.log('Seeding completed successfully!');
    return {
      adminEmail: 'admin@queuecare.com',
      doctorEmail: 'doctor.sarah@queuecare.com',
      patientEmail: 'patient.john@queuecare.com',
      passwordDefault: 'admin123 / doctor123 / patient123',
    };
  } catch (err) {
    console.error('Seeding error:', err);
    throw err;
  }
};

module.exports = { seedDatabase };
