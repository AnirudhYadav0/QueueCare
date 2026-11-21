import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ListOrdered, Stethoscope, Users, Clock, CheckCircle2, ArrowRight, RefreshCw, Eye } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useSocket } from '../../context/SocketContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

export const QueueManagement = () => {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const fetchQueues = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllQueues();
      setQueues(res.data?.queues || []);
    } catch (err) {
      toast.error('Failed to load clinic queues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();
  }, []);

  // Listen to admin queue updates
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => fetchQueues();
    socket.on('admin_queue_update', handleUpdate);
    socket.on('queue_updated', handleUpdate);
    return () => {
      socket.off('admin_queue_update', handleUpdate);
      socket.off('queue_updated', handleUpdate);
    };
  }, [socket]);

  if (loading) {
    return <Loader message="Monitoring clinic queues in real-time..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Live Synchronized Board
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Clinic Queue Monitor
          </h1>
          <p className="text-sm text-slate-500">
            Real-time multi-room monitoring across all attending doctors and clinical departments.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={fetchQueues}>
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Queues
        </Button>
      </div>

      {queues.length === 0 ? (
        <Card padding="p-12" className="text-center text-xs text-slate-400">
          No queues have been opened yet for today. Queues initialize automatically when doctors check in or call patients.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {queues.map((q) => (
            <Card key={q._id} padding="p-6" className="flex flex-col justify-between hover:shadow-card transition-all">
              <div>
                <div className="flex items-start justify-between pb-4 border-b border-slate-100 gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        q.doctor?.user?.avatar ||
                        'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=100'
                      }
                      alt={q.doctor?.user?.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Dr. {q.doctor?.user?.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {q.doctor?.department?.name} • Room {q.doctor?.roomNumber}
                      </p>
                    </div>
                  </div>
                  <Badge status={q.status} />
                </div>

                {/* Queue Numbers */}
                <div className="mt-5 grid grid-cols-2 gap-3 text-center">
                  <div className="bg-slate-900 text-white rounded-2xl p-3.5">
                    <span className="text-[10px] text-teal-400 uppercase font-bold tracking-wider">
                      Now Serving
                    </span>
                    <div className="text-3xl font-black mt-1">
                      {q.currentServingToken || '—'}
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                      Waiting Line
                    </span>
                    <div className="text-3xl font-bold text-amber-600 mt-1">
                      {q.totalWaiting || 0}
                    </div>
                  </div>
                </div>

                {/* Mini Stats */}
                <div className="mt-4 flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl">
                  <span>Completed: <strong className="text-emerald-700">{q.totalCompleted || 0}</strong></span>
                  <span>Skipped: <strong className="text-slate-700">{q.totalSkipped || 0}</strong></span>
                  <span>Total Tokens: <strong className="text-slate-900">{q.totalTokens || 0}</strong></span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  Avg Pace: ~{q.doctor?.avgConsultationMinutes || 15}m
                </span>
                <Link to={`/queue/${q.doctor?._id || q.doctor}`}>
                  <Button variant="ghost" size="sm" className="text-brand-600 hover:text-brand-800">
                    <Eye className="w-3.5 h-3.5" /> Full Board
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default QueueManagement;
