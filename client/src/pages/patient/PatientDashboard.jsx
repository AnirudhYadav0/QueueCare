import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarPlus,
  CalendarCheck,
  ListOrdered,
  Clock,
  Users,
  QrCode,
  ArrowRight,
  Sparkles,
  Stethoscope,
  ChevronRight,
  Activity,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { queueService } from '../../services/queueService';
import { appointmentService } from '../../services/appointmentService';
import { Card, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [activeQueue, setActiveQueue] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [queueRes, appRes] = await Promise.all([
        queueService.getPatientQueueStatus(),
        appointmentService.getMyAppointments({ filter: 'upcoming' }),
      ]);

      setActiveQueue(queueRes.data?.activeQueue || null);
      setUpcomingAppointments(appRes.data?.appointments || []);
    } catch (err) {
      console.warn('Dashboard fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Listen to live queue updates over Socket.IO
  useEffect(() => {
    if (!socket) return;

    const handleQueueUpdate = () => {
      // Re-fetch patient queue metrics when an event occurs
      queueService.getPatientQueueStatus().then((res) => {
        if (res.data?.activeQueue) {
          setActiveQueue(res.data.activeQueue);
        }
      });
    };

    socket.on('queue_updated', handleQueueUpdate);
    socket.on('token_called', handleQueueUpdate);

    return () => {
      socket.off('queue_updated', handleQueueUpdate);
      socket.off('token_called', handleQueueUpdate);
    };
  }, [socket]);

  const handleQuickCheckIn = async (appointmentId) => {
    try {
      const res = await appointmentService.checkIn(appointmentId);
      toast.success(res.message || 'Check-in confirmed! You are now in the live queue.');
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Check-in failed');
    }
  };

  if (loading) {
    return <Loader message="Loading your patient portal..." />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-brand-600/15">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-brand-100 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" /> Patient Care Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {user?.name || 'Patient'}
          </h1>
          <p className="mt-1 text-sm text-brand-100 max-w-xl">
            Welcome to QueueCare. Monitor your live token status, check into appointments, or schedule new visits.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/patient/book">
            <Button variant="secondary" size="md" className="shadow-sm">
              <CalendarPlus className="w-4 h-4 text-brand-600" /> Book Appointment
            </Button>
          </Link>
          <Link to="/patient/queue">
            <Button
              variant="outline"
              size="md"
              className="border-white text-white hover:bg-white/10"
            >
              <ListOrdered className="w-4 h-4" /> Live Queue Board
            </Button>
          </Link>
        </div>
      </div>

      {/* Active Live Token Banner (If patient is in today's queue) */}
      {activeQueue?.hasToken && activeQueue.token ? (
        <div className="rounded-3xl bg-white border-2 border-brand-500 p-6 sm:p-8 shadow-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                Live Queue In Session
              </span>
            </div>
            <Badge status={activeQueue.token.status} />
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            {/* Token */}
            <div className="bg-gradient-to-tr from-brand-600 to-indigo-600 text-white rounded-2xl p-5 text-center shadow-md">
              <span className="text-xs uppercase tracking-wider text-brand-100 font-semibold">Your Token</span>
              <div className="text-4xl sm:text-5xl font-black mt-1">
                {activeQueue.token.tokenNumber}
              </div>
              <p className="text-[11px] text-brand-100 mt-1 capitalize font-medium">
                Status: {activeQueue.token.status?.replace('_', ' ')}
              </p>
            </div>

            {/* Currently Serving */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-center">
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Now Serving</span>
              <div className="text-3xl font-bold text-slate-800 mt-1">
                {activeQueue.currentServingToken || 'Preparing'}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 truncate">
                {activeQueue.currentServingPatient ? `Patient: ${activeQueue.currentServingPatient}` : 'Next patient up'}
              </p>
            </div>

            {/* Patients Ahead */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-center">
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Patients Ahead</span>
              <div className="text-3xl font-bold text-amber-600 mt-1">
                {activeQueue.token.patientsAhead ?? 0}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {activeQueue.token.patientsAhead === 0
                  ? "You're next in line!"
                  : `${activeQueue.token.patientsAhead} patient(s) waiting before you`}
              </p>
            </div>

            {/* Estimated Wait */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-center">
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Est. Wait Time</span>
              <div className="text-3xl font-bold text-teal-600 mt-1">
                {activeQueue.token.estimatedWaitMinutes ?? 0} min
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Dr. {activeQueue.doctor?.name} • Room {activeQueue.doctor?.roomNumber}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              ⚡ Wait times calculate dynamically from actual clinic speed. You do not need to refresh.
            </p>
            <Link
              to="/patient/queue"
              className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
            >
              Open Full Live Screen <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : activeQueue?.hasToken === false && activeQueue.appointment ? (
        /* Appointment Today But Not Yet Checked In */
        <div className="rounded-3xl bg-amber-50 border border-amber-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                You have an appointment today with Dr. {activeQueue.appointment.doctor?.user?.name}!
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Scheduled for today at <strong>{activeQueue.appointment.timeSlot}</strong>. Check in now to enter the queue and claim your digital token.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={() => handleQuickCheckIn(activeQueue.appointment._id)}
          >
            <QrCode className="w-4 h-4" /> Check In & Get Token
          </Button>
        </div>
      ) : null}

      {/* Grid: Upcoming Appointments & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Appointments (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-brand-600" /> Upcoming Appointments
            </h2>
            <Link
              to="/patient/appointments"
              className="text-xs font-semibold text-brand-600 hover:text-brand-800"
            >
              View all appointments →
            </Link>
          </div>

          {upcomingAppointments.length === 0 ? (
            <Card padding="p-8" className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">No Upcoming Appointments</h3>
              <p className="text-xs text-slate-500 mt-1">
                You have no scheduled consultations. Book one with our specialists.
              </p>
              <Link to="/patient/book" className="inline-block mt-4">
                <Button size="sm" variant="primary">
                  <CalendarPlus className="w-4 h-4" /> Book Appointment Now
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.slice(0, 3).map((app) => (
                <Card key={app._id} hover padding="p-5" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <img
                      src={
                        app.doctor?.user?.avatar ||
                        'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=120'
                      }
                      alt={app.doctor?.user?.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">
                          Dr. {app.doctor?.user?.name || 'Physician'}
                        </h4>
                        <Badge status={app.status} />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {app.doctor?.department?.name || 'Specialty'} • Room {app.doctor?.roomNumber}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-600 mt-2">
                        <span className="font-semibold text-brand-700">
                          {new Date(app.appointmentDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span>•</span>
                        <span>{app.timeSlot}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link to={`/appointments/${app._id}`}>
                      <Button variant="secondary" size="sm">
                        Details & Pass
                      </Button>
                    </Link>
                    {app.status === 'scheduled' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleQuickCheckIn(app._id)}
                      >
                        Check In
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Utilities & Fast Actions (1 Col) */}
        <div className="space-y-6">
          <Card padding="p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Quick Patient Actions</h3>
            <div className="space-y-2.5">
              <Link
                to="/patient/book"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-brand-50/60 hover:text-brand-700 transition-colors border border-slate-100 text-xs font-semibold text-slate-700 group"
              >
                <div className="flex items-center gap-2.5">
                  <CalendarPlus className="w-4 h-4 text-brand-600" />
                  <span>Book New Appointment</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                to="/checkin"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-teal-50/60 hover:text-teal-700 transition-colors border border-slate-100 text-xs font-semibold text-slate-700 group"
              >
                <div className="flex items-center gap-2.5">
                  <QrCode className="w-4 h-4 text-teal-600" />
                  <span>Contactless QR Check-In</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                to="/patient/appointments"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 hover:text-indigo-700 transition-colors border border-slate-100 text-xs font-semibold text-slate-700 group"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Medical History & Records</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </Card>

          {/* Need help banner */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white text-xs space-y-3">
            <div className="flex items-center gap-2 text-teal-400 font-bold uppercase tracking-wider text-[10px]">
              <Activity className="w-3.5 h-3.5" /> Emergency Support
            </div>
            <p className="text-slate-300 leading-relaxed">
              If you require urgent medical attention or severe assistance, contact emergency triage at +1 (800) 555-CARE immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
