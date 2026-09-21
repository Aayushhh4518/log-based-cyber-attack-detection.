import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDemo } from '../context/DemoContext';

const ThreatActivityChart = () => {
  const { logs, demoState } = useDemo();

  // Derive time-bucketed event counts from demo logs
  const chartData = useMemo(() => {
    if (demoState !== 'complete' || logs.length === 0) {
      return [
        { time: '00:00', events: 0 },
        { time: '04:00', events: 0 },
        { time: '08:00', events: 0 },
        { time: '12:00', events: 0 },
        { time: '16:00', events: 0 },
        { time: '20:00', events: 0 },
        { time: '24:00', events: 0 },
      ];
    }

    const buckets = { '00:00': 0, '04:00': 0, '08:00': 0, '12:00': 0, '16:00': 0, '20:00': 0, '24:00': 0 };
    const bucketKeys = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'];

    logs.forEach(log => {
      const timePart = log.timestamp.split(' ')[1]; // "HH:MM:SS"
      if (!timePart) return;
      const hour = parseInt(timePart.split(':')[0], 10);
      // Find the nearest bucket
      let bucketIdx = Math.floor(hour / 4);
      if (bucketIdx >= bucketKeys.length) bucketIdx = bucketKeys.length - 1;
      buckets[bucketKeys[bucketIdx]]++;
    });

    return bucketKeys.map(time => ({ time, events: buckets[time] }));
  }, [logs, demoState]);

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <h3 className="text-lg font-semibold text-slate-100 mb-6">Threat Activity</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="time" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
              itemStyle={{ color: '#60a5fa' }}
            />
            <Area type="monotone" dataKey="events" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorEvents)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ThreatActivityChart;
