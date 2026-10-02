export interface Officer {
  id: number;
  username: string;
  name: string;
  badge_number: string;
  role: 'officer' | 'admin';
  created_at: string | null;
}

export interface Violation {
  id: number;
  challan_id: string;
  vehicle_number: string;
  violation_type: string;
  location: string;
  violation_date: string;
  fine_amount: number;
  payment_status: 'PAID' | 'UNPAID';
  paid_at?: string | null;
  payment_reference?: string | null;
  officer_badge?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  qr_code?: string;
  public_url?: string;
}

export interface Pagination {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ViolationFilterParams {
  search?: string;
  vehicle_number?: string;
  challan_id?: string;
  status?: string;
  violation_type?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

export interface DashboardStats {
  total_violations: number;
  paid_violations: number;
  unpaid_violations: number;
  today_violations: number;
  total_fine_collected: number;
  total_fine_pending: number;
  type_distribution: { type: string; count: number }[];
  status_distribution: { status: string; count: number }[];
  trend_7_days: { date: string; count: number }[];
  recent_violations: Violation[];
}

export interface VehicleSummary {
  total_violations: number;
  paid_violations: number;
  unpaid_violations: number;
  total_fines: number;
  pending_fines: number;
}

export interface VehicleHistoryResponse {
  vehicle_number: string;
  summary: VehicleSummary;
  violations: Violation[];
}

export interface PublicChallan {
  challan_id: string;
  vehicle_number: string;
  violation_type: string;
  location: string;
  violation_date: string;
  fine_amount: number;
  payment_status: 'PAID' | 'UNPAID';
  paid_at: string | null;
  payment_reference: string | null;
  notes: string | null;
  qr_code: string;
  public_url: string;
  verified_by: string;
  issuing_authority: string;
}
