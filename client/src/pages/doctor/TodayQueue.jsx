import React, { useState, useEffect } from 'react';
import {
  ListOrdered,
  Volume2,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Users,
  Clock,
  FileText,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { doctorService } from '../../services/doctorService';
import { queueService } from '../../services/queueService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

export const TodayQueue = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [queue, setQueue] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
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

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await doctorService.getMyTodayQueue();
      setQueue(res.data?.queue || null);
      setDoctorProfile(res.data?.doctor || null);
    } catch (err) {
      toast.error('Failed to load queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = (newQueue) => setQueue(newQueue);
    socket.on('queue_updated', handleUpdate);
    return () => socket.off('queue_updated', handleUpdate);
  }, [socket]);

  const handleCallNext = async () => {
    try {
      setActionLoading(true);
      const res = await queueService.callNext();
      toast.success(res.message);
      setQueue(res.data?.queue);
    } catch (err) {
      toast.error(err.message || 'No patients waiting in queue');
    } finally {
      setActionLoading(false);
    }
  };

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

  const handleConfirmComplete = async () => {
    if (!completeTarget) return;
    try {
      setActionLoading(true);
      const res = await queueService.completeConsultation(completeTarget._id, {
        prescription,
        notes,
      });
      toast.success('Consultation completed');
      setIsCompleteModalOpen(false);
      setCompleteTarget(null);
      setPrescription('');
      setNotes('');
      setQueue(res.data?.queue);
    } catch (err) {
      toast.error(err.message || 'Failed to complete consultation');
    } finally {
      setActionLoading(false);
    }
  };

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

  if (loading) {
    return <Loader message="Connecting to queue console..." />;
  }

  const waitingTokens = queue?.tokens?.filter((t) => t.status === 'waiting') || [];
  const activeToken = queue?.tokens?.find(
    (t) => t.status === 'calling' || t.status === 'in_consultation'
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Live Workstation Console
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Today's Consultation Queue
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchQueue}
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>

          <Button
            variant="primary"
            size="md"
            loading={actionLoading}
            onClick={handleCallNext}
            disabled={waitingTokens.length === 0}
          >
            <Volume2 className="w-4 h-4" /> Call Next Patient ({waitingTokens.length} waiting)
          </Button>
        </div>
      </div>

      {/* Active Call / In Consultation Spotlight */}
      {activeToken && (
        <Card padding="p-6" className="border-2 border-brand-500 bg-brand-50/30 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white flex flex-col items-center justify-center font-black text-2xl shrink-0 shadow-md">
                <span>{activeToken.tokenNumber}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-extrabold text-brand-700 tracking-wider">
                    {activeToken.status === 'calling'
                      ? 'Current Token Being Called'
                      : 'Consultation In Progress'}
                  </span>
                  <Badge status={activeToken.status} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  {activeToken.patientName}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Checked in at{' '}
                  {new Date(activeToken.checkInTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {activeToken.status === 'calling' && (
                <Button
                  variant="teal"
                  size="md"
                  onClick={() => handleStartConsultation(activeToken._id)}
                >
                  <Play className="w-4 h-4" /> Start Consultation
                </Button>
              )}

              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setCompleteTarget(activeToken);
                  setIsCompleteModalOpen(true);
                }}
              >
                <CheckCircle2 className="w-4 h-4" /> Complete Visit
              </Button>

              <Button
                variant="ghost"
                size="md"
                className="text-slate-600 hover:text-rose-600"
                onClick={() => {
                  setSkipTarget(activeToken);
                  setIsSkipModalOpen(true);
                }}
              >
                <XCircle className="w-4 h-4" /> Skip
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Complete Table of all tokens */}
      <Card padding="p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <h3 className="text-base font-bold text-slate-900">Patient Queue Sequence</h3>
          <span className="text-xs text-slate-500 font-semibold">
            {queue?.tokens?.length || 0} total tokens registered
          </span>
        </div>

        {queue?.tokens?.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No patient tokens currently in queue.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Token</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Checked In</th>
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
                    <td className="py-3.5 px-4">
                      <Badge status={token.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {token.checkInTime
                        ? new Date(token.checkInTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
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
                          Start
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
                          Complete
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

      {/* Complete Modal */}
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
                Clinical Diagnosis & Advice
              </label>
              <textarea
                rows={3}
                placeholder="Clinical assessment, diagnostics summary, follow-up..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Prescribed Medications
              </label>
              <textarea
                rows={3}
                placeholder="Dosage, frequency, course length..."
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
                Confirm Completion
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Skip Modal */}
      {skipTarget && (
        <Modal
          isOpen={isSkipModalOpen}
          onClose={() => setIsSkipModalOpen(false)}
          title={`Skip Patient: ${skipTarget.patientName}`}
          subtitle={`Token: ${skipTarget.tokenNumber}`}
        >
          <div className="space-y-4">
            <Input
              label="Reason for Skip"
              value={skipReason}
              onChange={(e) => setSkipReason(e.target.value)}
            />
            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setIsSkipModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" loading={actionLoading} onClick={handleConfirmSkip}>
                Confirm Skip
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TodayQueue;
