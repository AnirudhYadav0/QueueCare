import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ListOrdered,
  Clock,
  Users,
  Stethoscope,
  Volume2,
  AlertCircle,
  CheckCircle2,
  Building2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { queueService } from '../../services/queueService';
import { doctorService } from '../../services/doctorService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

export const LiveQueueTracking = () => {
  const { doctorId: paramDoctorId } = useParams();
  const { user } = useAuth();
  const { socket, joinDoctorQueue, leaveDoctorQueue } = useSocket();

  const [activeDoctorId, setActiveDoctorId] = useState(paramDoctorId || '');
  const [doctorsList, setDoctorsList] = useState([]);
  const [queueData, setQueueData] = useState(null);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [myTokenInfo, setMyTokenInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [calledAlert, setCalledAlert] = useState(null);

  // Load doctors list and initial queue
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [docRes, myStatusRes] = await Promise.all([
          doctorService.getDoctors(),
          user ? queueService.getPatientQueueStatus() : Promise.resolve({ data: {} }),
        ]);

        const docs = docRes.data?.doctors || [];
        setDoctorsList(docs);

        const myActive = myStatusRes.data?.activeQueue;
        if (myActive && myActive.token) {
          setMyTokenInfo(myActive.token);
        }

        // Determine which doctor queue to show
        let targetDocId = paramDoctorId;
        if (!targetDocId && myActive?.doctor?.id) {
          targetDocId = myActive.doctor.id;
        } else if (!targetDocId && docs.length > 0) {
          targetDocId = docs[0]._id;
        }

        setActiveDoctorId(targetDocId);
      } catch (err) {
        console.warn('Queue init error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [paramDoctorId]);

  // Fetch queue data for selected doctor
  const fetchQueue = async (docId) => {
    if (!docId) return;
    try {
      setRefreshing(true);
      const res = await queueService.getDoctorQueue(docId);
      setQueueData(res.data?.queue || null);
      setDoctorInfo(res.data?.doctor || null);

      // Check if user has a token in this queue
      if (user && res.data?.queue?.tokens) {
        const found = res.data.queue.tokens.find(
          (t) => t.patient === user.id || t.patient?._id === user.id
        );
        if (found) {
          setMyTokenInfo(found);
        }
      }
    } catch (err) {
      toast.error('Failed to load queue details');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (activeDoctorId) {
      fetchQueue(activeDoctorId);
      joinDoctorQueue(activeDoctorId);

      return () => {
        leaveDoctorQueue(activeDoctorId);
      };
    }
  }, [activeDoctorId]);

  // Socket event listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleQueueUpdated = (newQueue) => {
      console.log('Real-time queue update received:', newQueue);
      setQueueData(newQueue);

      // Update my token info if in list
      if (user && newQueue.tokens) {
        const found = newQueue.tokens.find(
          (t) => t.patient === user.id || t.patient?._id === user.id
        );
        if (found) {
          setMyTokenInfo(found);
        }
      }
    };

    const handleTokenCalled = (callData) => {
      // If it's my token, show prominent alert
      if (myTokenInfo && myTokenInfo.tokenNumber === callData.tokenNumber) {
        setCalledAlert(callData);
        toast.custom(
          (t) => (
            <div className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white p-5 rounded-2xl shadow-2xl border-2 border-purple-300 ring-4 ring-purple-500/30 max-w-md w-full animate-bounce">
              <div className="flex items-center gap-3">
                <Volume2 className="w-8 h-8 text-yellow-300 shrink-0" />
                <div>
                  <h4 className="font-extrabold text-base">YOUR TURN HAS ARRIVED!</h4>
                  <p className="text-xs text-purple-100 mt-1">
                    Token {callData.tokenNumber}: Please proceed immediately to Consultation Room {callData.roomNumber}.
                  </p>
                </div>
              </div>
            </div>
          ),
          { duration: 15000 }
        );
      }
    };

    socket.on('queue_updated', handleQueueUpdated);
    socket.on('token_called', handleTokenCalled);

    return () => {
      socket.off('queue_updated', handleQueueUpdated);
      socket.off('token_called', handleTokenCalled);
    };
  }, [socket, myTokenInfo, user]);

  if (loading) {
    return <Loader message="Connecting to live clinic queue..." />;
  }

  const isMyTokenInThisQueue =
    myTokenInfo && queueData?.tokens?.some((t) => t.tokenNumber === myTokenInfo.tokenNumber);

  return (
    <div className="space-y-6">
      {/* Header & Doctor Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Live Real-Time Board
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Clinic Queue Tracker
          </h1>
        </div>

        {/* Doctor Selector */}
        <div className="flex items-center gap-3">
          <select
            value={activeDoctorId}
            onChange={(e) => setActiveDoctorId(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            {doctorsList.map((d) => (
              <option key={d._id} value={d._id}>
                Dr. {d.user?.name} ({d.department?.name})
              </option>
            ))}
          </select>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchQueue(activeDoctorId)}
            loading={refreshing}
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Prominent Called Alert Banner (If My Token is Called) */}
      {calledAlert && (
        <div className="rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white p-6 sm:p-8 shadow-2xl border-4 border-yellow-300 ring-4 ring-purple-500/20 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-yellow-400 text-slate-900 flex items-center justify-center font-bold text-2xl shrink-0 shadow-lg">
              <Volume2 className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-extrabold text-yellow-300">
                Action Required
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-1">
                Token {calledAlert.tokenNumber}: You Are Being Called!
              </h2>
              <p className="mt-2 text-sm text-purple-100 max-w-xl">
                Please proceed directly to <strong>Room {calledAlert.roomNumber}</strong>. Dr. {calledAlert.doctorName} is ready to begin your consultation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Doctor & Room Summary Card */}
      {doctorInfo && (
        <Card padding="p-5" className="bg-white border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={
                  doctorInfo.avatar ||
                  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150'
                }
                alt={doctorInfo.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200"
              />
              <div>
                <h3 className="text-base font-bold text-slate-900">Dr. {doctorInfo.name}</h3>
                <p className="text-xs text-slate-500">
                  {doctorInfo.specialization} • Department of {doctorInfo.department}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                Room: <span className="text-brand-700 font-bold">{doctorInfo.roomNumber}</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                Avg. Pace: <span className="text-slate-800 font-bold">~{doctorInfo.avgConsultationMinutes} min</span>
              </div>
              <Badge status={doctorInfo.isAvailable ? 'active' : 'closed'} text={doctorInfo.isAvailable ? 'Consulting' : 'Break'} />
            </div>
          </div>
        </Card>
      )}

      {/* Primary Live Queue Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Current Serving */}
        <div className="rounded-3xl bg-slate-900 text-white p-6 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-teal-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              Now Serving
            </span>
            <div className="text-5xl font-black mt-3 text-white tracking-tight">
              {queueData?.currentServingToken || 'Preparing'}
            </div>
            <p className="text-xs text-slate-300 mt-2">
              {queueData?.currentServingPatient
                ? `Patient: ${queueData.currentServingPatient}`
                : 'Next token being prepared'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            Current Status: <strong className="text-teal-300 capitalize">{queueData?.currentServingStatus?.replace('_', ' ') || 'Idle'}</strong>
          </div>
        </div>

        {/* Your Token (Highlighted if user has one) */}
        <div
          className={`rounded-3xl p-6 shadow-xl flex flex-col justify-between ${
            isMyTokenInThisQueue
              ? 'bg-gradient-to-tr from-brand-600 via-brand-700 to-indigo-700 text-white'
              : 'bg-white border border-slate-200/80 text-slate-800'
          }`}
        >
          <div>
            <span
              className={`text-xs uppercase tracking-wider font-bold ${
                isMyTokenInThisQueue ? 'text-brand-100' : 'text-slate-400'
              }`}
            >
              Your Digital Token
            </span>
            <div
              className={`text-5xl font-black mt-3 tracking-tight ${
                isMyTokenInThisQueue ? 'text-white' : 'text-slate-400'
              }`}
            >
              {isMyTokenInThisQueue ? myTokenInfo.tokenNumber : '—'}
            </div>
            <p
              className={`text-xs mt-2 ${
                isMyTokenInThisQueue ? 'text-brand-100' : 'text-slate-500'
              }`}
            >
              {isMyTokenInThisQueue
                ? `Position in queue: #${myTokenInfo.sequence}`
                : 'No active token in this doctor’s queue'}
            </p>
          </div>
          <div
            className={`mt-4 pt-3 border-t text-[11px] ${
              isMyTokenInThisQueue
                ? 'border-white/20 text-brand-100 font-medium'
                : 'border-slate-100 text-slate-400'
            }`}
          >
            {isMyTokenInThisQueue ? (
              <span className="capitalize font-bold">Status: {myTokenInfo.status?.replace('_', ' ')}</span>
            ) : (
              <Link to="/patient/book" className="text-brand-600 font-bold hover:underline">
                Book an appointment →
              </Link>
            )}
          </div>
        </div>

        {/* Patients Ahead */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-subtle flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">
              Patients Ahead
            </span>
            <div className="text-5xl font-black mt-3 text-amber-600 tracking-tight">
              {isMyTokenInThisQueue ? myTokenInfo.patientsAhead ?? 0 : queueData?.totalWaiting ?? 0}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {isMyTokenInThisQueue
                ? myTokenInfo.patientsAhead === 0
                  ? "You're next up!"
                  : `${myTokenInfo.patientsAhead} waiting before your turn`
                : `${queueData?.totalWaiting ?? 0} total patients currently waiting`}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Total tokens today: <strong className="text-slate-800">{queueData?.totalTokens || 0}</strong>
          </div>
        </div>

        {/* Estimated Wait Time */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-subtle flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">
              Estimated Wait
            </span>
            <div className="text-5xl font-black mt-3 text-teal-600 tracking-tight">
              {isMyTokenInThisQueue
                ? `${myTokenInfo.estimatedWaitMinutes ?? 0}m`
                : `${(queueData?.totalWaiting || 0) * (doctorInfo?.avgConsultationMinutes || 15)}m`}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Calculated dynamically from live queue rate
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Consultations completed: <strong className="text-emerald-600">{queueData?.totalCompleted || 0}</strong>
          </div>
        </div>
      </div>

      {/* Live Queue Table / Roster */}
      <Card padding="p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Today's Token Roster</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status for all tokens checked into Dr. {doctorInfo?.name}'s queue today.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {queueData?.tokens?.length || 0} entries
          </span>
        </div>

        {queueData?.tokens?.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No patients checked into this queue yet today.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Token</th>
                  <th className="py-3 px-4">Patient Reference</th>
                  <th className="py-3 px-4">Check-In Time</th>
                  <th className="py-3 px-4">Queue Status</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Est. Wait</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {queueData?.tokens?.map((token) => {
                  const isMine =
                    myTokenInfo && myTokenInfo.tokenNumber === token.tokenNumber;

                  return (
                    <tr
                      key={token._id || token.tokenNumber}
                      className={`hover:bg-slate-50 transition-colors ${
                        isMine ? 'bg-brand-50/60 font-bold' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <span className="text-sm font-black text-slate-900 flex items-center gap-2">
                          {token.tokenNumber}
                          {isMine && (
                            <span className="text-[10px] bg-brand-600 text-white px-2 py-0.5 rounded-full font-bold">
                              YOU
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium">
                        {isMine
                          ? token.patientName
                          : token.patientName.replace(/(.{2}).+(.{2})/, '$1***$2')}
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
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-800">
                        {token.status === 'waiting'
                          ? `~${token.estimatedWaitMinutes ?? 0} min`
                          : token.status === 'in_consultation' || token.status === 'calling'
                          ? 'Now'
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default LiveQueueTracking;
