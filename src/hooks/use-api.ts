/**
 * React Query hooks for SFCPC backend API.
 * Wraps api.ts functions with caching, loading states, and error handling.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listProducts,
  createProduct,
  deleteProduct,
  updateBalance,
  listMovements,
  listBalances,
  getFinancialSummary,
  getFinancialTransactions,
  chatWithAgent,
  type ProductSchema,
} from "@/lib/api";

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------

export function useProducts(limit = 50, offset = 0) {
  return useQuery({
    queryKey: ["products", limit, offset],
    queryFn: () => listProducts(limit, offset),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (product: ProductSchema) => createProduct(product),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => deleteProduct(code),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateBalance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ code, delta, reason }: { code: string; delta: number; reason?: string }) =>
      updateBalance(code, delta, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["balances"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Movements & Balances
// ---------------------------------------------------------------------------

export function useMovements(limit = 50, offset = 0) {
  return useQuery({
    queryKey: ["movements", limit, offset],
    queryFn: () => listMovements(limit, offset),
  });
}

export function useBalances(limit = 50, offset = 0) {
  return useQuery({
    queryKey: ["balances", limit, offset],
    queryFn: () => listBalances(limit, offset),
  });
}

// ---------------------------------------------------------------------------
// Financial
// ---------------------------------------------------------------------------

export function useFinancialSummary(period = "30d") {
  return useQuery({
    queryKey: ["financial-summary", period],
    queryFn: () => getFinancialSummary(period),
  });
}

export function useFinancialTransactions(period = "30d") {
  return useQuery({
    queryKey: ["financial-transactions", period],
    queryFn: () => getFinancialTransactions(period),
  });
}

// ---------------------------------------------------------------------------
// Agent
// ---------------------------------------------------------------------------

export function useAgentChat() {
  return useMutation({
    mutationFn: (message: string) => chatWithAgent(message),
  });
}
