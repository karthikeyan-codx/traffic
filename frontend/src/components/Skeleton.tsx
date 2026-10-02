import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return <div className={`animate-shimmer rounded-lg ${className}`} />;
};

export const StatCardSkeleton: React.FC = () => {
  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between h-32">
      <div className="flex items-center justify-between">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-10 h-10 rounded-xl" />
      </div>
      <div>
        <Skeleton className="w-28 h-8 mb-2" />
        <Skeleton className="w-36 h-3" />
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC = () => {
  return (
    <tr className="border-b border-slate-100">
      <td className="py-4 px-4"><Skeleton className="w-28 h-4" /></td>
      <td className="py-4 px-4"><Skeleton className="w-24 h-6 rounded-md" /></td>
      <td className="py-4 px-4"><Skeleton className="w-32 h-4" /></td>
      <td className="py-4 px-4"><Skeleton className="w-36 h-4" /></td>
      <td className="py-4 px-4"><Skeleton className="w-20 h-4" /></td>
      <td className="py-4 px-4"><Skeleton className="w-16 h-6 rounded-full" /></td>
      <td className="py-4 px-4 text-right"><Skeleton className="w-20 h-7 ml-auto rounded-lg" /></td>
    </tr>
  );
};

export const ChallanSkeleton: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto glass-panel rounded-2xl p-8 shadow-sm">
      <div className="flex justify-between items-center border-b border-slate-200 pb-6 mb-6">
        <div className="flex gap-4 items-center">
          <Skeleton className="w-16 h-16 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="w-48 h-6" />
            <Skeleton className="w-32 h-4" />
          </div>
        </div>
        <Skeleton className="w-36 h-10 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
};
