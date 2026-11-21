import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import AboutPage from './pages/public/AboutPage';
import FeaturesPage from './pages/public/FeaturesPage';
import ContactPage from './pages/public/ContactPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import QRCheckInPage from './pages/public/QRCheckInPage';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import BookAppointment from './pages/patient/BookAppointment';
import MyAppointments from './pages/patient/MyAppointments';
import LiveQueueTracking from './pages/patient/LiveQueueTracking';
import AppointmentDetails from './pages/patient/AppointmentDetails';
import PatientNotifications from './pages/patient/PatientNotifications';
import PatientProfile from './pages/patient/PatientProfile';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import TodayQueue from './pages/doctor/TodayQueue';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorSchedule from './pages/doctor/DoctorSchedule';
import DoctorProfile from './pages/doctor/DoctorProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import DoctorManagement from './pages/admin/DoctorManagement';
import PatientManagement from './pages/admin/PatientManagement';
import AppointmentManagement from './pages/admin/AppointmentManagement';
import DepartmentManagement from './pages/admin/DepartmentManagement';
import QueueManagement from './pages/admin/QueueManagement';
import Analytics from './pages/admin/Analytics';
import ClinicSettings from './pages/admin/ClinicSettings';

export function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            {/* Global Toast Notifier */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  borderRadius: '16px',
                  background: '#0f172a',
                  color: '#fff',
                  fontSize: '13px',
                },
              }}
            />

            <Routes>
              {/* Public Routes with Navbar & Footer */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/checkin" element={<QRCheckInPage />} />
                <Route path="/queue/:doctorId" element={<LiveQueueTracking />} />
                <Route path="/appointments/:id" element={<AppointmentDetails />} />
              </Route>

              {/* Patient Workspace (Protected: role = patient) */}
              <Route
                path="/patient"
                element={<DashboardLayout allowedRoles={['patient']} />}
              >
                <Route index element={<PatientDashboard />} />
                <Route path="book" element={<BookAppointment />} />
                <Route path="appointments" element={<MyAppointments />} />
                <Route path="queue" element={<LiveQueueTracking />} />
                <Route path="queue/:doctorId" element={<LiveQueueTracking />} />
                <Route path="notifications" element={<PatientNotifications />} />
                <Route path="profile" element={<PatientProfile />} />
              </Route>

              {/* Doctor Workspace (Protected: role = doctor) */}
              <Route
                path="/doctor"
                element={<DashboardLayout allowedRoles={['doctor']} />}
              >
                <Route index element={<DoctorDashboard />} />
                <Route path="queue" element={<TodayQueue />} />
                <Route path="appointments" element={<DoctorAppointments />} />
                <Route path="schedule" element={<DoctorSchedule />} />
                <Route path="profile" element={<DoctorProfile />} />
              </Route>

              {/* Admin Workspace (Protected: role = admin) */}
              <Route
                path="/admin"
                element={<DashboardLayout allowedRoles={['admin']} />}
              >
                <Route index element={<AdminDashboard />} />
                <Route path="doctors" element={<DoctorManagement />} />
                <Route path="patients" element={<PatientManagement />} />
                <Route path="appointments" element={<AppointmentManagement />} />
                <Route path="departments" element={<DepartmentManagement />} />
                <Route path="queues" element={<QueueManagement />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="settings" element={<ClinicSettings />} />
              </Route>

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
