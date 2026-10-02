import type {
  Officer,
  Violation,
  Pagination,
  ViolationFilterParams,
  DashboardStats,
  VehicleHistoryResponse,
  PublicChallan,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const token = localStorage.getItem('traffic_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      ...this.getHeaders(),
      ...(options.headers || {}),
    };

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || data.message || `Request failed with status ${response.status}`;
        const error = new Error(errorMessage) as any;
        error.status = response.status;
        error.validation_errors = data.validation_errors;
        throw error;
      }

      return data as T;
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Unable to connect to the traffic server. Ensure the backend is running.');
      }
      throw err;
    }
  }

  // --- Auth Endpoints ---
  async login(username: string, password: string): Promise<{ token: string; officer: Officer; message: string }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async getMe(): Promise<{ officer: Officer }> {
    return this.request('/auth/me');
  }

  async logout(): Promise<{ message: string }> {
    return this.request('/auth/logout', { method: 'POST' });
  }

  // --- Violations Endpoints ---
  async getViolationTypes(): Promise<{ types: string[] }> {
    return this.request('/violations/types');
  }

  async getViolations(params: ViolationFilterParams = {}): Promise<{ violations: Violation[]; pagination: Pagination }> {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.vehicle_number) query.append('vehicle_number', params.vehicle_number);
    if (params.challan_id) query.append('challan_id', params.challan_id);
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.violation_type && params.violation_type !== 'ALL') query.append('violation_type', params.violation_type);
    if (params.date_from) query.append('date_from', params.date_from);
    if (params.date_to) query.append('date_to', params.date_to);
    if (params.page) query.append('page', params.page.toString());
    if (params.per_page) query.append('per_page', params.per_page.toString());

    const qs = query.toString();
    return this.request(`/violations${qs ? `?${qs}` : ''}`);
  }

  async getViolationById(id: string | number): Promise<{ violation: Violation }> {
    return this.request(`/violations/${id}`);
  }

  async createViolation(payload: Partial<Violation>): Promise<{ message: string; violation: Violation }> {
    return this.request('/violations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateViolation(id: string | number, payload: Partial<Violation>): Promise<{ message: string; violation: Violation }> {
    return this.request(`/violations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async updatePaymentStatus(
    id: string | number,
    payment_status: 'PAID' | 'UNPAID',
    payment_reference?: string
  ): Promise<{ message: string; violation: Violation }> {
    return this.request(`/violations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ payment_status, payment_reference }),
    });
  }

  async deleteViolation(id: string | number): Promise<{ message: string }> {
    return this.request(`/violations/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Dashboard Endpoints ---
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request('/dashboard/stats');
  }

  // --- Vehicles Endpoints ---
  async getVehicleHistory(vehicleNumber: string): Promise<VehicleHistoryResponse> {
    return this.request(`/vehicles/${encodeURIComponent(vehicleNumber)}/history`);
  }

  // --- Public Challan Endpoints ---
  async getPublicChallan(challanId: string): Promise<{ challan: PublicChallan }> {
    return this.request(`/public/challan/${encodeURIComponent(challanId)}`);
  }

  async publicPayChallan(challanId: string, paymentMethod?: string): Promise<{ message: string; challan_id: string; payment_status: string; paid_at: string; payment_reference: string }> {
    return this.request(`/public/challan/${encodeURIComponent(challanId)}/pay`, {
      method: 'POST',
      body: JSON.stringify({ payment_method: paymentMethod || 'ONLINE_UPI' }),
    });
  }
}

export const api = new ApiService();
