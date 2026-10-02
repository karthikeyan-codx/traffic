import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: 'PAID' | 'UNPAID';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const isPaid = status === 'PAID';

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3.5 py-1.5 text-sm font-semibold',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  if (isPaid) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 tracking-wide ${sizeClasses[size]}`}
      >
        {showIcon && <CheckCircle2 className={`${iconSizes[size]} text-emerald-600`} />}
        PAID
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 text-rose-700 tracking-wide ${sizeClasses[size]}`}
    >
      {showIcon && <Clock className={`${iconSizes[size]} text-rose-600`} />}
      UNPAID
    </span>
  );
};
