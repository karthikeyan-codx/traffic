import React from 'react';
import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    type: 'positive' | 'neutral' | 'danger';
  };
  colorTheme?: 'blue' | 'green' | 'red' | 'amber';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  colorTheme = 'blue',
}) => {
  const themeStyles = {
    blue: {
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-100',
      accent: 'border-l-4 border-l-blue-500',
    },
    green: {
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      accent: 'border-l-4 border-l-emerald-500',
    },
    red: {
      iconBg: 'bg-rose-50 text-rose-600 border border-rose-100',
      accent: 'border-l-4 border-l-rose-500',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-100',
      accent: 'border-l-4 border-l-amber-500',
    },
  };

  const badgeStyles = {
    positive: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const selectedTheme = themeStyles[colorTheme];

  return (
    <div
      className={`glass-panel rounded-2xl p-5 transition-all duration-300 hover:shadow-md hover:border-slate-300/80 ${selectedTheme.accent}`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${selectedTheme.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </span>
        {badge && (
          <span
            className={`text-xs px-2 py-0.5 rounded-md font-medium border ${badgeStyles[badge.type]}`}
          >
            {badge.text}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
};
