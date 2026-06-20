import React from 'react';

const StatsCard = ({ title, value, icon: Icon, trend, trendType = 'neutral', subtitle }) => {
  const getTrendColor = () => {
    if (trendType === 'positive') return 'text-emerald-600 dark:text-emerald-400';
    if (trendType === 'negative') return 'text-rose-600 dark:text-rose-400';
    return 'text-slate-500 dark:text-slate-400';
  };

  return (
    <div className="glass-card p-6 flex items-start justify-between hover:shadow-md transition-shadow">
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          {title}
        </span>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white m-0">
          {value}
        </h3>
        {subtitle && (
          <span className="text-xs text-slate-400 block">{subtitle}</span>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-1 text-xs">
            <span className={`font-semibold ${getTrendColor()}`}>{trend}</span>
            <span className="text-slate-400">vs last period</span>
          </div>
        )}
      </div>

      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};

export default StatsCard;
