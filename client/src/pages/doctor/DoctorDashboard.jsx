import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Volume2,
  Play,
  RotateCcw,
  Stethoscope,
  CalendarCheck,
  Building,
  AlertCircle,
  FileText,
  Activity,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { doctorService } from '../../services/doctorService';
import { queueService } from '../../services/queueService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [queue, setQueue] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Complete consultation modal
  const [completeTarget, setCompleteTarget] = useState(null);
  const [prescription, setPrescription] = useState('');
  const [notes, setNotes] = useState('');
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  // Skip modal
  const [skipTarget, setSkipTarget] = useState(null);
  const [skipReason, setSkipReason] = useState('Patient not present when called');
  const [isSkipModalOpen, setIsSkipModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [qRes, appRes] = await Promise.all([
        doctorService.getMyTodayQueue(),
        doctorService.getMyAppointments(),
      ]);

      setQueue(qRes.data?.queue || null);
      setDoctorProfile(qRes.data?.doctor || null);
      setAppointments(appRes.data?.appointments || []);
    } catch (err) {
      console.warn('Doctor dashboard fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Real-time queue updates from Socket.IO
  useEffect(() => {
    if (!socket) return;

    const handleQueueUpdated = (newQueue) => {
      setQueue(newQueue);
    };

    socket.on('queue_updated', handleQueueUpdated);

    return () => {
      socket.off('queue_updated', handleQueueUpdated);
    };
  }, [socket]);

  // Call Next Patient
  const handleCallNext = async () => {
    try {
      setActionLoading(true);
      const res = await queueService.callNext();
      toast.success(res.message || 'Called next patient!');
      setQueue(res.data?.queue);
    } catch (err) {
      toast.error(err.message || 'No patients waiting in queue');
    } finally {
      setActionLoading(false);
    }
  };

  // Start Consultation
  const handleStartConsultation = async (tokenId) => {
    try {
      setActionLoading(true);
      const res = await queueService.startConsultation(tokenId);
      toast.success('Consultation started');
      setQueue(res.data?.queue);
    } catch (err) {
      toast.error(err.message || 'Failed to start consultation');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Completed Consultation
  const handleConfirmComplete = async () => {
    if (!completeTarget) return;
    try {
      setActionLoading(true);
      const res = await queueService.completeConsultation(completeTarget._id, {
        prescription,
        notes,
      });
      toast.success('Consultation marked as completed');
      setIsCompleteModalOpen(false);
      setCompleteTarget(null);
      setPrescription('');
      setNotes('');
      setQueue(res.data?.queue);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to complete consultation');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Skip Patient
  const handleConfirmSkip = async () => {
    if (!skipTarget) return;
    try {
      setActionLoading(true);
      const res = await queueService.skipPatient(skipTarget._id, skipReason);
      toast.success('Patient marked as skipped');
      setIsSkipModalOpen(false);
      setSkipTarget(null);
      setSkipReason('Patient not present when called');
      setQueue(res.data?.queue);
    } catch (err) {
      toast.error(err.message || 'Failed to skip patient');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Doctor Availability
  const handleToggleAvailability = async () => {
    try {
      const res = await doctorService.toggleAvailability();
      setDoctorProfile(res.data?.doctor);
      toast.success(
        res.data?.doctor?.isAvailable
          ? 'You are now marked as AVAILABLE for consultations'
          : 'You are now marked on BREAK / UNAVAILABLE'
      );
    } catch (err) {
      toast.error('Failed to update availability status');
    }
  };

  if (loading) {
    return <Loader message="Loading doctor workstation..." />;
  }

  const waitingCount = queue?.tokens?.filter((t) => t.status === 'waiting').length || 0;
  const completedCount = queue?.tokens?.filter((t) => t.status === 'completed').length || 0;
  const inConsultationToken = queue?.tokens?.find(
    (t) => t.status === 'in_consultation' || t.status === 'calling'
  );

  return (
    <div className="space-y-6">
      {/* Top Header & Workstation Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-subtle">
        <div className="flex items-center gap-4">
          <img
            src={
              user?.avatar ||
              'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150'
            }
            alt={user?.name}
            className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {user?.name}
              </h1>
              <Badge
                status={doctorProfile?.isAvailable ? 'active' : 'closed'}
                text={doctorProfile?.isAvailable ? 'Available' : 'On Break'}
              />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {doctorProfile?.specialization} • Room {doctorProfile?.roomNumber}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant={doctorProfile?.isAvailable ? 'secondary' : 'teal'}
            size="sm"
            onClick={handleToggleAvailability}
          >
            {doctorProfile?.isAvailable ? 'Pause / Take Break' : 'Resume Availability'}
          </Button>

          <Button
            variant="primary"
            size="md"
            loading={actionLoading}
            onClick={handleCallNext}
            disabled={waitingCount === 0 || !doctorProfile?.isAvailable}
            className="shadow-md shadow-brand-500/20"
          >
            <Volume2 className="w-4 h-4" /> Call Next Patient
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Scheduled Today"
          value={appointments.length}
          subtitle="Patient visits on calendar"
          icon={CalendarCheck}
          color="blue"
        />
        <StatCard
          title="Currently Waiting"
          value={waitingCount}
          subtitle="Checked in and in line"
          icon={Users}
          color="amber"
        />
        <StatCard
          title="Consultations Done"
          value={completedCount}
          subtitle="Completed today"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Average Pace"
          value={`~${doctorProfile?.avgConsultationMinutes || 15}m`}
          subtitle="Estimated time per visit"
          icon={Clock}
          color="indigo"
        />
      </div>

      {/* Active Consultation Console / Now Calling */}
      {inConsultationToken ? (
        <Card padding="p-6" className="border-2 border-brand-500 bg-brand-50/20 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex flex-col items-center justify-center font-black text-xl shrink-0 shadow-md">
                <span>{inConsultationToken.tokenNumber}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-extrabold text-brand-700 tracking-wider">
                    {inConsultationToken.status === 'calling'
                      ? 'Patient Now Being Called'
                      : 'Active Consultation in Progress'}
                  </span>
                  <Badge status={inConsultationToken.status} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  {inConsultationToken.patientName}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Checked in at{' '}
                  {new Date(inConsultationToken.checkInTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            {/* Quick Consultation Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {inConsultationToken.status === 'calling' && (
                <Button
                  variant="teal"
                  size="md"
                  onClick={() => handleStartConsultation(inConsultationToken._id)}
                >
                  <Play className="w-4 h-4" /> Start Consultation
                </Button>
              )}

              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setCompleteTarget(inConsultationToken);
                  setIsCompleteModalOpen(true);
                }}
              >
                <CheckCircle2 className="w-4 h-4" /> Complete & Prescribe
              </Button>

              <Button
                variant="ghost"
                size="md"
                className="text-slate-600 hover:text-rose-600"
                onClick={() => {
                  setSkipTarget(inConsultationToken);
                  setIsSkipModalOpen(true);
                }}
              >
                <XCircle className="w-4 h-4" /> Skip Patient
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card padding="p-6" className="bg-slate-50 border-dashed text-center">
          <p className="text-xs font-semibold text-slate-500">
            No patient currently in consultation.{' '}
            {waitingCount > 0
              ? 'Click "Call Next Patient" above to call the next token.'
              : 'Queue is currently empty.'}
          </p>
        </Card>
      )}

      {/* Live Queue Table */}
      <Card padding="p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Today's Patient Queue</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live waiting list synchronized with clinic waiting area.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600">
            {waitingCount} waiting • {completedCount} completed
          </span>
        </div>

        {queue?.tokens?.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No patients have checked in to your queue today.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Token</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Checked In</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {queue?.tokens?.map((token) => (
                  <tr key={token._id || token.tokenNumber} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                      {token.tokenNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {token.patientName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {token.checkInTime
                        ? new Date(token.checkInTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={token.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {token.status === 'waiting' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleStartConsultation(token._id)}
                          >
                            Call
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-600"
                            onClick={() => {
                              setSkipTarget(token);
                              setIsSkipModalOpen(true);
                            }}
                          >
                            Skip
                          </Button>
                        </div>
                      )}
                      {token.status === 'calling' && (
                        <Button
                          variant="teal"
                          size="sm"
                          onClick={() => handleStartConsultation(token._id)}
                        >
                          Start Visit
                        </Button>
                      )}
                      {token.status === 'in_consultation' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setCompleteTarget(token);
                            setIsCompleteModalOpen(true);
                          }}
                        >
                          Finish
                        </Button>
                      )}
                      {['completed', 'skipped'].includes(token.status) && (
                        <span className="text-slate-400 font-medium capitalize">
                          {token.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Complete Consultation Modal */}
      {completeTarget && (
        <Modal
          isOpen={isCompleteModalOpen}
          onClose={() => setIsCompleteModalOpen(false)}
          title={`Complete Consultation: ${completeTarget.patientName}`}
          subtitle={`Token: ${completeTarget.tokenNumber}`}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Clinical Diagnosis & Consultation Notes
              </label>
              <textarea
                rows={3}
                placeholder="Diagnosis, vitals summary, follow-up advice..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Prescription & Medications
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Amoxicillin 500mg (3x daily for 7 days), Paracetamol 650mg SOS"
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <Button
                variant="secondary"
                onClick={() => setIsCompleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={actionLoading}
                onClick={handleConfirmComplete}
              >
                <CheckCircle2 className="w-4 h-4" /> Save & Mark Complete
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Skip Patient Modal */}
      {skipTarget && (
        <Modal
          isOpen={isSkipModalOpen}
          onClose={() => setIsSkipModalOpen(false)}
          title={`Skip Patient: ${skipTarget.patientName}`}
          subtitle={`Token: ${skipTarget.tokenNumber}`}
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Marking a patient as skipped removes them from the active queue. They can be re-queued by clinic reception if they arrive late.
            </p>

            <Input
              label="Reason for Skipping"
              placeholder="e.g. Patient not present when called, Patient requested reschedule"
              value={skipReason}
              onChange={(e) => setSkipReason(e.target.value)}
            />

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <Button
                variant="secondary"
                onClick={() => setIsSkipModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={actionLoading}
                onClick={handleConfirmSkip}
              >
                Confirm Skip
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DoctorDashboard;
