import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Printer,
  ArrowLeft,
  ExternalLink,
  Copy
} from 'lucide-react';
import { api } from '../services/api';
import type { Violation } from '../types';
import { ChallanReceipt } from '../components/ChallanReceipt';
import { ChallanSkeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';
import { useToast } from '../context/ToastContext';

export const ChallanView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success } = useToast();

  const [violation, setViolation] = useState<Violation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchViolation = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.getViolationById(id);
      setViolation(res.violation);
    } catch (err: any) {
      setError(err.message || 'Challan record could not be found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViolation();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (!violation) return;
    const url = `${window.location.origin}/public/challan/${violation.challan_id}`;
    navigator.clipboard.writeText(url);
    success('Public verification link copied to clipboard.');
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8 max-w-4xl mx-auto">
        <ChallanSkeleton />
      </div>
    );
  }

  if (error || !violation) {
    return (
      <div className="p-8 max-w-md mx-auto">
        <ErrorState
          title="Challan Not Found"
          message={error || 'No traffic challan found matching this identifier.'}
          onRetry={fetchViolation}
        />
        <div className="text-center mt-4">
          <Link to="/violations" className="text-xs font-semibold text-blue-600 hover:underline">
            ← Return to History
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Copy Public Link */}
          <button
            onClick={handleCopyLink}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>Copy Link</span>
          </button>

          {/* View Public Status */}
          <a
            href={`/public/challan/${violation.challan_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
            <span>View Public Status</span>
          </a>

          {/* Print Challan */}
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print Challan Receipt</span>
          </button>
        </div>
      </div>

      {/* Official Government Digital Challan Document */}
      <ChallanReceipt violation={violation} />
    </div>
  );
};
