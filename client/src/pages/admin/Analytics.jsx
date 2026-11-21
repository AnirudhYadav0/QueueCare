import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line,
} from 'recharts';
import { adminService } from '../../services/adminService';
import { Card, CardHeader } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { BarChart3, TrendingUp, Users, Clock, ArrowDownRight, Award } from 'lucide-react';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

export const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await adminService.getAnalytics();
        setData(res.data || null);
      } catch (err) {
        toast.error('Failed to load clinic analytics');
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  if (loading) {
    return <Loader message="Compiling analytics & performance charts..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Clinical Analytics & Operational Insights
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Historical trends, peak hour clinic congestion, patient status distribution, and department throughput.
        </p>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Avg. Consultation Duration"
          value="14.8 min"
          subtitle="Calculated across all departments"
          icon={Clock}
          color="teal"
          trend="-2.4m vs last month"
        />
        <StatCard
          title="On-Time Queue Adherence"
          value="94.2%"
          subtitle="Patients seen within 10m of est."
          icon={TrendingUp}
          color="emerald"
          trend="+3.1%"
        />
        <StatCard
          title="Appointment Completion Rate"
          value="91.5%"
          subtitle="Low no-show rate with live SMS/QR"
          icon={Award}
          color="blue"
          trend="+5.0%"
        />
      </div>

      {/* 7-Day Trend Area Chart */}
      <Card padding="p-6">
        <CardHeader
          title="Daily Consultation Activity (Past 7 Days)"
          subtitle="Total volume comparing appointments, completed visits, and cancellations"
        />
        <div className="h-80 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.appointmentsByDay || []}>
              <defs>
                <linearGradient id="gradComp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', marginTop: '10px' }} />
              <Area
                type="monotone"
                dataKey="count"
                name="Total Booked"
                stroke="#0284c7"
                fillOpacity={1}
                fill="url(#gradTotal)"
              />
              <Area
                type="monotone"
                dataKey="completed"
                name="Completed Visits"
                stroke="#059669"
                fillOpacity={1}
                fill="url(#gradComp)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Two Column Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Patient Distribution */}
        <Card padding="p-6">
          <CardHeader
            title="Hourly Waiting Area Traffic Curve"
            subtitle="Hourly patient arrivals and clinic waiting room volume"
          />
          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.hourlyTraffic || []}>
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
                <Line
                  type="monotone"
                  dataKey="patients"
                  name="Arrivals"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="avgWait"
                  name="Avg Wait (min)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Status Distribution */}
        <Card padding="p-6">
          <CardHeader
            title="Appointment Outcome Breakdown"
            subtitle="Percentage of completed, in-progress, and cancelled visits"
          />
          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.statusDistribution || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={50}
                  paddingAngle={4}
                >
                  {(data?.statusDistribution || []).map((entry, index) => (
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
    </div>
  );
};

export default Analytics;
