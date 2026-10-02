import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Sparkles,
  MapPin,
  Calendar,
  IndianRupee,
  CarFront
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

// Standard penalty guide for quick auto-fill recommendations
const PENALTY_RATES: Record<string, number> = {
  'No Helmet': 1000,
  'Overspeeding': 2000,
  'Signal Violation': 1500,
  'No Seat Belt': 1000,
  'Drunk Driving': 10000,
  'Wrong Parking': 500,
  'Triple Riding': 1000,
  'Using Mobile Phone': 5000,
  'Dangerous Driving': 5000,
  'Without Valid License': 5000,
  'Expired Insurance': 2000,
  'Pollution Under Control (PUC) Violation': 1000,
};

export const ViolationCreate: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [violationTypes, setViolationTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [violationType, setViolationType] = useState('No Helmet');
  const [location, setLocation] = useState('');
  const [violationDate, setViolationDate] = useState(() => {
    const now = new Date();
    // Format YYYY-MM-DDTHH:mm
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, 16);
    return localISOTime;
  });
  const [fineAmount, setFineAmount] = useState<number | string>(1000);
  const [notes, setNotes] = useState('');

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await api.getViolationTypes();
        setViolationTypes(res.types);
        if (res.types.length > 0) {
          setViolationType(res.types[0]);
          if (PENALTY_RATES[res.types[0]]) {
            setFineAmount(PENALTY_RATES[res.types[0]]);
          }
        }
      } catch {
        // Fallback
      }
    };
    fetchTypes();
  }, []);

  const handleTypeChange = (newType: string) => {
    setViolationType(newType);
    if (PENALTY_RATES[newType]) {
      setFineAmount(PENALTY_RATES[newType]);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    const cleanVehicle = vehicleNumber.trim().toUpperCase();
    if (!cleanVehicle) {
      newErrors.vehicle_number = 'Vehicle registration number is required.';
    } else if (cleanVehicle.length < 4 || cleanVehicle.length > 20) {
      newErrors.vehicle_number = 'Vehicle number must be between 4 and 20 characters.';
    }

    if (!violationType.trim()) {
      newErrors.violation_type = 'Please select a violation type.';
    }

    if (!location.trim()) {
      newErrors.location = 'Violation location / intersection is required.';
    } else if (location.trim().length < 3) {
      newErrors.location = 'Location must be at least 3 characters.';
    }

    if (!violationDate) {
      newErrors.violation_date = 'Violation date and time is required.';
    }

    const amount = Number(fineAmount);
    if (!fineAmount || isNaN(amount) || amount <= 0) {
      newErrors.fine_amount = 'Fine amount must be a positive number greater than 0.';
    } else if (amount > 500000) {
      newErrors.fine_amount = 'Fine amount cannot exceed ₹500,000.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toastError('Please fix the validation errors before submitting.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.createViolation({
        vehicle_number: vehicleNumber.trim().toUpperCase(),
        violation_type: violationType,
        location: location.trim(),
        violation_date: violationDate,
        fine_amount: Number(fineAmount),
        notes: notes.trim() || undefined,
      });

      success('Traffic violation logged successfully! Challan generated.');
      // Direct immediately to digital challan receipt
      navigate(`/challans/${res.violation.challan_id}`);
    } catch (err: any) {
      if (err.validation_errors) {
        setErrors(err.validation_errors);
      }
      toastError(err.message || 'Unable to record violation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb / Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/violations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Violation History</span>
        </Link>

        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Status: Automatic UNPAID
        </span>
      </div>

      {/* Main Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md">
        <div className="flex items-center gap-3.5 mb-6 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Issue Digital Traffic Challan
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Record a new traffic infraction. A verifiable QR code and receipt will be generated automatically.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Vehicle Number & Violation Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Vehicle Registration Number *
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-3 text-slate-400">
                  <CarFront className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => {
                    setVehicleNumber(e.target.value.toUpperCase());
                    if (errors.vehicle_number) setErrors({ ...errors, vehicle_number: '' });
                  }}
                  placeholder="e.g. DL-01-AB-1234 or KA05MN9876"
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-white border rounded-xl text-sm font-mono font-bold tracking-wider placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.vehicle_number
                      ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/20'
                      : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                  required
                />
              </div>
              {errors.vehicle_number && (
                <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.vehicle_number}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Traffic Violation Classification *
              </label>
              <select
                value={violationType}
                onChange={(e) => {
                  handleTypeChange(e.target.value);
                  if (errors.violation_type) setErrors({ ...errors, violation_type: '' });
                }}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
                required
              >
                {violationTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.violation_type && (
                <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.violation_type}
                </p>
              )}
            </div>
          </div>

          {/* Row 2: Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Infraction Location / Intersection *
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-3 text-slate-400">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  if (errors.location) setErrors({ ...errors, location: '' });
                }}
                placeholder="e.g. Outer Ring Road, Bellandur Junction, Bengaluru"
                className={`w-full pl-10 pr-3.5 py-2.5 bg-white border rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.location
                    ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/20'
                    : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                }`}
                required
              />
            </div>
            {errors.location && (
              <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.location}
              </p>
            )}
          </div>

          {/* Row 3: Date & Fine Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Date & Time of Infraction *
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-3 text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="datetime-local"
                  value={violationDate}
                  onChange={(e) => {
                    setViolationDate(e.target.value);
                    if (errors.violation_date) setErrors({ ...errors, violation_date: '' });
                  }}
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-white border rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 transition-all ${
                    errors.violation_date
                      ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/20'
                      : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                  required
                />
              </div>
              {errors.violation_date && (
                <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.violation_date}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Fine Amount (INR) *
                </label>
                {PENALTY_RATES[violationType] && (
                  <span className="text-[11px] font-semibold text-blue-600 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Standard: ₹{PENALTY_RATES[violationType]}
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-3 text-slate-400">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  min="100"
                  max="500000"
                  step="50"
                  value={fineAmount}
                  onChange={(e) => {
                    setFineAmount(e.target.value);
                    if (errors.fine_amount) setErrors({ ...errors, fine_amount: '' });
                  }}
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-white border rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                    errors.fine_amount
                      ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/20'
                      : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                  required
                />
              </div>
              {errors.fine_amount && (
                <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.fine_amount}
                </p>
              )}
            </div>
          </div>

          {/* Row 4: Remarks / Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Officer Observations / Specific Evidence Remarks
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Helmet missing on rider, captured via mobile patrol patrol unit camera."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Submission Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              to="/violations"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 active:scale-95 disabled:opacity-60"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{loading ? 'Recording to SQLite...' : 'Generate & Issue Challan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
