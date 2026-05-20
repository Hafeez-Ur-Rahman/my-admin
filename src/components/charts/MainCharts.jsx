/* eslint-disable */
import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const data = [
  { name: '1 May', sales: 4000 },
  { name: '5 May', sales: 12000 },
  { name: '10 May', sales: 11000 },
  { name: '15 May', sales: 18765 },
  { name: '20 May', sales: 14000 },
  { name: '25 May', sales: 21000 },
  { name: '30 May', sales: 30000 },
];

const pieData = [
  { name: "Men's Perfume", value: 42 },
  { name: "Women's Perfume", value: 35 },
  { name: 'Unisex Perfume', value: 15 },
  { name: 'Gift Sets', value: 8 },
];

const COLORS = ['#D4AF37', '#f9d053', '#dbb758', '#BDBDBD'];

export const SalesAreaChart = ({ chartData }) => {
  const displayData = chartData && chartData.length > 0 ? chartData : data;
  
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <AreaChart data={displayData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
            </linearGradient>
            <filter id="shadow" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
              <feOffset in="blur" dx="0" dy="8" result="offsetBlur" />
              <feFlood floodColor="#D4AF37" floodOpacity="0.3" result="offsetColor" />
              <feComposite in="offsetColor" in2="offsetBlur" operator="in" result="offsetBlur" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="rgba(255,255,255,0.02)" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }}
            dy={15}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }}
            dx={-10}
          />
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ stroke: '#D4AF37', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.5 }}
          />
          <Area
            type="monotone"
            dataKey="sales"
            stroke="#D4AF37"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorSales)"
            filter="url(#shadow)"
            activeDot={{ r: 6, fill: '#D4AF37', stroke: '#fff', strokeWidth: 3, shadow: '0 0 20px rgba(212,175,55,0.8)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1a]/90 backdrop-blur-2xl border border-white/10 p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></div>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">{label} Analysis</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[9px] text-[#D4AF37]/60 font-bold uppercase tracking-wider">Total Revenue</p>
          <p className="text-2xl font-serif text-white italic">
            {new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 }).format(payload[0].value)}
          </p>
        </div>
        <div className="mt-4 pt-4 border-t border-white/5">
           <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500/20 flex items-center justify-center">
                 <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
              </span>
              <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">Growth Detected</span>
           </div>
        </div>
      </div>
    );
  }
  return null;
};

export const CategoryPieChart = ({ chartData, totalValue }) => {
  const displayData = chartData && chartData.length > 0 ? chartData : pieData;
  const displayTotal = totalValue || 24580;

  return (
    <div className="h-[250px] w-full relative">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <PieChart>
          <Pie
            data={displayData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {displayData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xs text-text-muted font-medium">Total Sales</span>
        <span className="text-xl font-bold text-white">
          {new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 }).format(displayTotal)}
        </span>
      </div>
    </div>
  );
};

