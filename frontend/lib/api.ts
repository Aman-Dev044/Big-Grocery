import type { Admin, Pagination, Product, Stats, UploadResult } from './types';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1004/api';
export const TOKEN_KEY = 'bbdh.admin.token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* private browsing — the session just won't persist */
  }
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}, auth = false): Promise<T> {
  const headers = new Headers(init.headers);
  if (auth) {
    const token = getToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API}${path}`, { cache: 'no-store', ...init, headers });
  const body = await res.json().catch(() => ({}));

  if (!res.ok || body.success === false) {
    throw new ApiError(body.message || `Request failed (${res.status})`, res.status);
  }
  return body;
}

export async function loginAdmin(email: string, password: string) {
  return request<{ success: true; message: string; data: { token: string; admin: Admin } }>(
    '/auth/login',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }
  );
}

export async function fetchMe() {
  return request<{ success: true; data: { admin: Admin } }>('/auth/me', {}, true);
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  status?: string;
}

export async function fetchProducts(query: ProductQuery = {}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  });
  return request<{ success: true; data: Product[]; pagination: Pagination }>(
    `/products?${params.toString()}`
  );
}

export async function fetchProduct(id: string) {
  return request<{ success: true; data: Product }>(`/products/${encodeURIComponent(id)}`);
}

export async function fetchStats() {
  return request<{ success: true; data: Stats }>('/products/stats');
}

export async function uploadBulk(excel: File, zip: File, replaceExisting = true) {
  const form = new FormData();
  form.append('excel', excel);
  form.append('zip', zip);
  form.append('replaceExisting', String(replaceExisting));
  return request<{ success: true; message: string; data: UploadResult }>(
    '/upload/bulk',
    { method: 'POST', body: form },
    true
  );
}

export async function deleteProducts(ids: string[]) {
  return request<{ success: true; message: string; data: { deletedCount: number; imagesRemoved: number } }>(
    '/products',
    {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    },
    true
  );
}

export async function deleteAllProducts() {
  return request<{ success: true; message: string; data: { deletedCount: number; batchesRemoved: number } }>(
    '/products/all',
    { method: 'DELETE' },
    true
  );
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export const inr = (n: number) =>
  `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export const STATUS_LABEL: Record<string, string> = {
  in_stock: 'In Stock',
  low_stock: 'Low Stock',
  out_of_stock: 'Out of Stock',
};

export const STATUS_CLASS: Record<string, string> = {
  in_stock: 'bg-emerald-50 text-emerald-700',
  low_stock: 'bg-amber-50 text-amber-700',
  out_of_stock: 'bg-rose-50 text-rose-600',
};

export function formatDateTime(iso: string): { date: string; time: string } {
  if (!iso) return { date: '—', time: '' };
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
  };
}
