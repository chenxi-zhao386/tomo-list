import React, { useMemo, useState } from 'react';
import { useStore } from '../store';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { format, subDays, isAfter, startOfDay, startOfWeek, startOfMonth } from 'date-fns';
import { Clock, Target, Award } from 'lucide-react';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function Dashboard() {
  const { records } = useStore();
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const filteredRecords = useMemo(() => {
    const now = new Date();
    let startDate;
    if (timeRange === 'daily') startDate = startOfDay(now);
    else if (timeRange === 'weekly') startDate = startOfWeek(now, { weekStartsOn: 1 });
    else startDate = startOfMonth(now);

    return records.filter(r => isAfter(r.startTime, startDate));
  }, [records, timeRange]);

  const stats = useMemo(() => {
    const totalSeconds = filteredRecords.reduce((acc, r) => acc + r.duration, 0);
    const totalPomodoros = filteredRecords.reduce((acc, r) => acc + (r.pomodorosCompleted || 0), 0);
    const totalSessions = filteredRecords.length;

    // Group by task name for pie chart
    const taskGroups = filteredRecords.reduce((acc, r) => {
      const name = r.name || 'Untitled';
      acc[name] = (acc[name] || 0) + r.duration;
      return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(taskGroups)
      .map(([name, duration]: [string, any]) => ({ name, value: Math.round(duration / 60) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Group by day for bar chart
    const days = timeRange === 'daily' ? 1 : timeRange === 'weekly' ? 7 : 30;
    const barData = Array.from({ length: days }).map((_, i) => {
      const date = subDays(new Date(), days - 1 - i);
      const dayStart = startOfDay(date).getTime();
      const dayEnd = dayStart + 86400000;
      
      const dayRecords = filteredRecords.filter(r => r.startTime >= dayStart && r.startTime < dayEnd);
      const duration = dayRecords.reduce((acc, r) => acc + r.duration, 0);
      
      return {
        name: format(date, days > 7 ? 'dd' : 'EEE'),
        minutes: Math.round(duration / 60)
      };
    });

    return {
      totalMinutes: Math.round(totalSeconds / 60),
      totalPomodoros,
      totalSessions,
      pieData,
      barData
    };
  }, [filteredRecords, timeRange]);

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
        <select 
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="daily">Today</option>
          <option value="weekly">This Week</option>
          <option value="monthly">This Month</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-indigo-50 p-4 rounded-xl flex flex-col items-center justify-center text-center">
          <Clock className="text-indigo-500 mb-2" size={24} />
          <div className="text-2xl font-bold text-indigo-700">{stats.totalMinutes}</div>
          <div className="text-xs text-indigo-600/80 font-medium uppercase tracking-wider">Minutes</div>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl flex flex-col items-center justify-center text-center">
          <Target className="text-emerald-500 mb-2" size={24} />
          <div className="text-2xl font-bold text-emerald-700">{stats.totalPomodoros}</div>
          <div className="text-xs text-emerald-600/80 font-medium uppercase tracking-wider">Pomodoros</div>
        </div>
        <div className="bg-amber-50 p-4 rounded-xl flex flex-col items-center justify-center text-center">
          <Award className="text-amber-500 mb-2" size={24} />
          <div className="text-2xl font-bold text-amber-700">{stats.totalSessions}</div>
          <div className="text-xs text-amber-600/80 font-medium uppercase tracking-wider">Sessions</div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-600 mb-4">Time Distribution (Minutes)</h3>
        <div className="h-48">
          {stats.pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {stats.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} min`, 'Duration']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">No data available</div>
          )}
        </div>
        {stats.pieData.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {stats.pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center text-xs text-gray-600">
                <div className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="truncate max-w-[80px]">{entry.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-600 mb-4">Activity Trend</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.barData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <Tooltip
                cursor={{ fill: '#f3f4f6' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="minutes" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
