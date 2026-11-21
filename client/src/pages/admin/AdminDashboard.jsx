import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Stethoscope,
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  TrendingUp,
  BarChart3,
  ArrowRight,
  ListOrdered,
  Settings,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { adminService } from '../../services/adminService';
import { Card, CardHeader } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, analyticsRes] = await Promise.all([
          adminService.getStats(),
          adminService.getAnalytics(),
        ]);

        setStats(statsRes.data || null);
        setAnalytics(analyticsRes.data || null);
      } catch (err) {
        toast.error('Failed to load admin analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Loader message="Loading clinic administration metrics..." />;
  }

  return (
    <div className="space-y-8">
      {/* Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Clinic Command Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time patient traffic, queue velocity, and clinical resource utilization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/queues">
            <Button variant="teal" size="sm">
              <ListOrdered className="w-4 h-4" /> Monitor Queues
            </Button>
          </Link>
          <Link to="/admin/doctors">
            <Button variant="primary" size="sm">
              <Stethoscope className="w-4 h-4" /> Manage Doctors
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Patients"
          value={stats?.totalPatients || 0}
          subtitle="Registered in portal"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Active Doctors"
          value={stats?.totalDoctors || 0}
          subtitle="Consulting staff"
          icon={Stethoscope}
          color="teal"
        />
        <StatCard
          title="Today's Visits"
          value={stats?.todayAppointments || 0}
          subtitle="Appointments today"
          icon={CalendarCheck}
          color="indigo"
        />
        <StatCard
          title="Waiting Now"
          value={stats?.waitingCount || 0}
          subtitle="In live queues"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Completed"
          value={stats?.completedTodayCount || 0}
          subtitle="Finished today"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Cancelled"
          value={stats?.cancelledCount || 0}
          subtitle="Slots released"
          icon={XCircle}
          color="rose"
        />
      </div>

      {/* Charts Row 1: 7-Day Trend & Status Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments Trend */}
        <Card padding="p-6" className="lg:col-span-2">
          <CardHeader
            title="Appointment Volume Trend (Last 7 Days)"
            subtitle="Scheduled, completed, and cancelled consultation counts"
          />
          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.appointmentsByDay || []}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Appointments"
                  stroke="#0284c7"
                  fillOpacity={1}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Status Distribution */}
        <Card padding="p-6">
          <CardHeader
            title="Appointment Statuses"
            subtitle="Current clinic consultation distribution"
          />
          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.statusDistribution || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={4}
                >
                  {(analytics?.statusDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Charts Row 2: Department Volume & Hourly Traffic */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Volume */}
        <Card padding="p-6">
          <CardHeader
            title="Department Patient Volume"
            subtitle="Appointments booked across clinical specialties"
          />
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.departmentPerformance || []}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="appointments" fill="#14b8a6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Hourly Patient Traffic */}
        <Card padding="p-6">
          <CardHeader
            title="Hourly Clinic Traffic Distribution"
            subtitle="Patient volume and average wait time by hour"
          />
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.hourlyTraffic || []}>
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="patients" name="Patients" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Quick Navigation to Management Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Link
          to="/admin/doctors"
          className="p-5 bg-white rounded-2xl border border-slate-200/80 hover:shadow-card transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Doctors</h4>
              <p className="text-xs text-slate-500">Add & edit doctors</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/admin/departments"
          className="p-5 bg-white rounded-2xl border border-slate-200/80 hover:shadow-card transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Departments</h4>
              <p className="text-xs text-slate-500">Codes & token prefixes</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/admin/queues"
          className="p-5 bg-white rounded-2xl border border-slate-200/80 hover:shadow-card transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <ListOrdered className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Queue Monitor</h4>
              <p className="text-xs text-slate-500">Live multi-room view</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/admin/settings"
          className="p-5 bg-white rounded-2xl border border-slate-200/80 hover:shadow-card transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand-50 text-brand-600 rounded-xl">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Clinic Settings</h4>
              <p className="text-xs text-slate-500">Operating hours & slots</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
