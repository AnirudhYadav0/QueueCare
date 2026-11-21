import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Clock,
  QrCode,
  AlertCircle,
  XCircle,
  Eye,
  ListOrdered,
  CalendarPlus,
  CheckCircle2,
} from 'lucide-react';
import { appointmentService } from '../../services/appointmentService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled

  // QR Modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Cancel Modal
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await appointmentService.getMyAppointments();
      setAppointments(res.data?.appointments || []);
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCheckIn = async (id) => {
    try {
      const res = await appointmentService.checkIn(id);
      toast.success(res.message || 'Check-in confirmed! You are now in the live queue.');
      fetchAppointments();
    } catch (err) {
      toast.error(err.message || 'Check-in failed');
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    try {
      setCancelling(true);
      await appointmentService.cancelAppointment(cancelTarget._id, cancelReason);
      toast.success('Appointment cancelled successfully');
      setIsCancelModalOpen(false);
      setCancelTarget(null);
      setCancelReason('');
      fetchAppointments();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel appointment');
    } finally {
      setCancelling(false);
    }
  };

  // Filter appointments
  const filteredAppointments = appointments.filter((app) => {
    const isPast =
      new Date(app.appointmentDate) < new Date(new Date().setUTCHours(0, 0, 0, 0)) ||
      ['completed', 'skipped'].includes(app.status);

    if (filter === 'upcoming') {
      return ['scheduled', 'checked_in', 'waiting', 'in_consultation'].includes(app.status) && !isPast;
    }
    if (filter === 'past') {
      return ['completed', 'skipped'].includes(app.status) || isPast;
    }
    if (filter === 'cancelled') {
      return app.status === 'cancelled';
    }
    return true;
  });

  if (loading) {
    return <Loader message="Loading your appointments..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Appointments</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your consultations, view digital check-in passes, and track live queue progress.
          </p>
        </div>
        <Link to="/patient/book">
          <Button variant="primary" size="md">
            <CalendarPlus className="w-4 h-4" /> Book New Visit
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'all', label: 'All Visits' },
          { id: 'upcoming', label: 'Upcoming & Active' },
          { id: 'past', label: 'Completed & Past' },
          { id: 'cancelled', label: 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
              filter === tab.id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No Appointments Found"
          description="There are no consultations matching your selected category."
          actionText="Book an Appointment"
          onAction={() => window.location.href = '/patient/book'}
        />
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((app) => {
            const isToday =
              new Date(app.appointmentDate).toDateString() === new Date().toDateString();

            return (
              <Card key={app._id} padding="p-5 sm:p-6" className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <img
                    src={
                      app.doctor?.user?.avatar ||
                      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150'
                    }
                    alt={app.doctor?.user?.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        Dr. {app.doctor?.user?.name || 'Physician'}
                      </h3>
                      <Badge status={app.status} />
                      {app.tokenNumber && (
                        <span className="text-xs font-extrabold bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full border border-teal-200">
                          Token: {app.tokenNumber}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 mt-0.5">
                      {app.doctor?.department?.name || 'Department'} • Room {app.doctor?.roomNumber}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      <span className="font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-lg border border-brand-100">
                        {new Date(app.appointmentDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-slate-800">{app.timeSlot}</span>
                      <span>•</span>
                      <span className="text-slate-500">Reason: {app.reason}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                  {/* Digital Pass Button */}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedApp(app);
                      setIsQRModalOpen(true);
                    }}
                  >
                    <QrCode className="w-3.5 h-3.5" /> Pass & PIN
                  </Button>

                  {/* Details Link */}
                  <Link to={`/appointments/${app._id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-3.5 h-3.5" /> Details
                    </Button>
                  </Link>

                  {/* Check In Action (if scheduled and today) */}
                  {app.status === 'scheduled' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleCheckIn(app._id)}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Check In
                    </Button>
                  )}

                  {/* Live Queue Link if in queue */}
                  {['waiting', 'calling', 'in_consultation'].includes(app.status) && (
                    <Link to={`/queue/${app.doctor?._id || app.doctor}`}>
                      <Button variant="teal" size="sm">
                        <ListOrdered className="w-3.5 h-3.5" /> Live Queue
                      </Button>
                    </Link>
                  )}

                  {/* Cancel Button */}
                  {['scheduled', 'waiting'].includes(app.status) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      onClick={() => {
                        setCancelTarget(app);
                        setIsCancelModalOpen(true);
                      }}
                    >
                      <XCircle className="w-3.5 h-3.5" /> Cancel
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* QR Pass Modal */}
      {selectedApp && (
        <Modal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          title="Digital Check-In Pass"
          subtitle={`Dr. ${selectedApp.doctor?.user?.name} • ${selectedApp.timeSlot}`}
        >
          <div className="text-center py-4">
            {selectedApp.qrCodeData ? (
              <img
                src={selectedApp.qrCodeData}
                alt="QR Code"
                className="w-48 h-48 mx-auto rounded-2xl border border-slate-200 p-2 shadow-sm bg-white"
              />
            ) : (
              <div className="w-48 h-48 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 text-xs">
                QR Code
              </div>
            )}

            <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-3 inline-block">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Security PIN
              </span>
              <div className="text-2xl font-mono font-extrabold text-slate-900 tracking-widest mt-0.5">
                {selectedApp.checkInPin}
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Show this QR code at the clinic reception scanner or enter your PIN on the digital kiosk upon arrival.
            </p>

            <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
              {selectedApp.status === 'scheduled' && (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    setIsQRModalOpen(false);
                    handleCheckIn(selectedApp._id);
                  }}
                >
                  Check In Now
                </Button>
              )}
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => window.print()}
              >
                Print Pass
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel Appointment Modal */}
      {cancelTarget && (
        <Modal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          title="Cancel Appointment"
          subtitle="Are you sure you want to cancel this consultation?"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Your booked time slot with Dr. {cancelTarget.doctor?.user?.name} on{' '}
              {new Date(cancelTarget.appointmentDate).toLocaleDateString()} at{' '}
              {cancelTarget.timeSlot} will be released.
            </p>

            <Input
              label="Reason for Cancellation (Optional)"
              placeholder="e.g. Schedule conflict, feeling better..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <Button
                variant="secondary"
                onClick={() => setIsCancelModalOpen(false)}
              >
                Keep Appointment
              </Button>
              <Button
                variant="danger"
                loading={cancelling}
                onClick={handleConfirmCancel}
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MyAppointments;
