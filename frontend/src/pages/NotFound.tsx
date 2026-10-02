import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-ambient-pattern text-center">
      <div className="max-w-md w-full glass-panel rounded-3xl p-8 border border-slate-200/90 shadow-xl space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div>
          <span className="font-mono text-4xl font-black text-blue-600">404</span>
          <h1 className="text-xl font-extrabold text-slate-900 mt-2">
            Page Not Found
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
            The requested page or traffic record does not exist or has been relocated within the department network.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20"
          >
            <Home className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </Link>
          <Link
            to="/violations"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>View Violations</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
