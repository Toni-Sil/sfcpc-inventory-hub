/**
 * SFCPC API Client
 * Connects to the Python/FastAPI backend at VITE_API_URL.
 * All authenticated requests include the JWT bearer token stored in memory.
 */

const BASE_URL = (import.meta.env.VITE_API_URL as string) ?? "http://localhost:8000";

// ---------------------------------------------------------------------------
// Types (mirrors backend Pydantic schemas)
// ---------------------------------------------------------------------------

export interface LoginRequest {
  tenant_id: string;
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface ProductSchema {
  id?: string;
  code: string;
  description: string;
  category: string;
  unit: string;
  tonalidade?: string;
  densidade?: string;
  metragem?: string;
  corredor: string;
  prateleira: string;
  validity?: string;
  batch?: string;
  current_stock?: number;
  min_stock?: number;
  status?: string;
}

export interface StockBalanceSchema {
  product_code: string;
  quantity: number;
  updated_at?: string;
}

export interface MovementSchema {
  id?: string;
  product_code: string;
  quantity: number;
  type: "ENTRY" | "EXIT";
  reason?: string;
  created_at?: string;
}

export interface FinancialSummarySchema {
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  period_start?: string;
  period_end?: string;
}

export interface AgentChatResponse {
  reply: string;
}

// ---------------------------------------------------------------------------
// Token management (in-memory — no localStorage due to iframe sandboxing)
// ---------------------------------------------------------------------------

let _token: string | null = null;

export function setToken(token: string) {
  _token = token;
}

export function clearToken() {
  _token = null;
}

export function getToken(): string | null {
  return _token;
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (_token) {
    headers["Authorization"] = `Bearer ${_token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail ?? `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const result = await apiFetch<LoginResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
  setToken(result.access_token);
  return result;
}

export async function register(data: {
  tenant_id: string;
  username: string;
  password: string;
  email?: string;
}) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ---------------------------------------------------------------------------
// Inventory / Products
// ---------------------------------------------------------------------------

export async function listProducts(
  limit = 50,
  offset = 0
): Promise<ProductSchema[]> {
  return apiFetch<ProductSchema[]>(
    `/api/v1/inventory?limit=${limit}&offset=${offset}`
  );
}

export async function getProduct(code: string): Promise<ProductSchema> {
  return apiFetch<ProductSchema>(`/api/v1/inventory/${code}`);
}

export async function createProduct(
  product: ProductSchema
): Promise<ProductSchema> {
  return apiFetch<ProductSchema>("/api/v1/inventory", {
    method: "POST",
    body: JSON.stringify(product),
  });
}

export async function deleteProduct(code: string): Promise<void> {
  return apiFetch<void>(`/api/v1/inventory/${code}`, { method: "DELETE" });
}

export async function updateBalance(
  code: string,
  delta: number,
  reason = "Ajuste"
): Promise<StockBalanceSchema> {
  return apiFetch<StockBalanceSchema>(`/api/v1/inventory/${code}/balance`, {
    method: "POST",
    body: JSON.stringify({ delta, reason }),
  });
}

// ---------------------------------------------------------------------------
// Stock Movements
// ---------------------------------------------------------------------------

export async function listMovements(
  limit = 50,
  offset = 0
): Promise<MovementSchema[]> {
  return apiFetch<MovementSchema[]>(
    `/movements?limit=${limit}&offset=${offset}`
  );
}

export async function listBalances(
  limit = 50,
  offset = 0
): Promise<StockBalanceSchema[]> {
  return apiFetch<StockBalanceSchema[]>(
    `/balances?limit=${limit}&offset=${offset}`
  );
}

// ---------------------------------------------------------------------------
// Financial
// ---------------------------------------------------------------------------

export async function getFinancialSummary(
  period = "30d"
): Promise<FinancialSummarySchema> {
  return apiFetch<FinancialSummarySchema>(
    `/api/v1/financial/summary?period=${period}`
  );
}

export async function getFinancialTransactions(period = "30d") {
  return apiFetch(`/api/v1/financial/transactions?period=${period}`);
}

// ---------------------------------------------------------------------------
// LLM Agent
// ---------------------------------------------------------------------------

export async function chatWithAgent(
  message: string
): Promise<AgentChatResponse> {
  return apiFetch<AgentChatResponse>("/api/v1/agent/chat", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

export async function healthCheck() {
  return apiFetch<{ status: string; service: string; version: string }>("/");
}
