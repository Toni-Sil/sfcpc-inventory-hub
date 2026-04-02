// Mock data for S.F.C.P.C inventory management

export type Product = {
  id: string;
  code: string;
  description: string;
  category: "Tecidos" | "Espumas" | "Madeiras" | "Ferragens";
  unit: "metro" | "peça" | "kg";
  tonalidade?: string;
  densidade?: string;
  metragem?: string;
  corredor: string;
  prateleira: string;
  currentStock: number;
  minStock: number;
  validity?: string;
  batch?: string;
  status: "Normal" | "Baixo" | "Crítico";
};

export type Movement = {
  id: string;
  productId: string;
  productName: string;
  type: "Entrada" | "Saída" | "Transferência" | "Ajuste";
  quantity: number;
  date: string;
  operator: string;
  notes?: string;
  batch?: string;
  locationOrigin?: string;
  locationDestiny?: string;
};

export type StockBalance = {
  id: string;
  productName: string;
  productCode: string;
  batch: string;
  location: string;
  currentBalance: number;
  lastUpdated: string;
};

export type Invoice = {
  id: string;
  supplierClient: string;
  type: "Entrada" | "Saída";
  value: number;
  date: string;
  dueDate: string;
  status: "Pago" | "Pendente" | "Cancelado";
};

export type Alert = {
  id: string;
  title: string;
  description: string;
  severity: "Crítico" | "Alerta" | "Info";
  type: "Estoque Baixo" | "Produto Vencendo" | "Movimentação Anômala";
  date: string;
  resolved: boolean;
};

export const products: Product[] = [
  { id: "1", code: "TEC-001", description: "Tecido Suede Cinza", category: "Tecidos", unit: "metro", tonalidade: "Cinza", corredor: "A", prateleira: "1", currentStock: 250, minStock: 50, batch: "L2024-01", status: "Normal" },
  { id: "2", code: "TEC-002", description: "Tecido Linho Bege", category: "Tecidos", unit: "metro", tonalidade: "Bege", corredor: "A", prateleira: "2", currentStock: 30, minStock: 50, batch: "L2024-02", status: "Baixo" },
  { id: "3", code: "ESP-001", description: "Espuma D33 10cm", category: "Espumas", unit: "peça", densidade: "D33", corredor: "B", prateleira: "1", currentStock: 120, minStock: 30, batch: "L2024-03", status: "Normal" },
  { id: "4", code: "ESP-002", description: "Espuma D45 15cm", category: "Espumas", unit: "peça", densidade: "D45", corredor: "B", prateleira: "2", currentStock: 8, minStock: 20, batch: "L2024-04", status: "Crítico" },
  { id: "5", code: "MAD-001", description: "Pinus Tratado 2m", category: "Madeiras", unit: "peça", corredor: "C", prateleira: "1", currentStock: 85, minStock: 20, batch: "L2024-05", status: "Normal" },
  { id: "6", code: "MAD-002", description: "MDF 15mm 2,75x1,84", category: "Madeiras", unit: "peça", corredor: "C", prateleira: "2", currentStock: 45, minStock: 15, batch: "L2024-06", status: "Normal" },
  { id: "7", code: "FER-001", description: "Dobradiça Sofá-Cama", category: "Ferragens", unit: "peça", corredor: "D", prateleira: "1", currentStock: 200, minStock: 50, batch: "L2024-07", status: "Normal" },
  { id: "8", code: "FER-002", description: "Mola Espiral 12cm", category: "Ferragens", unit: "peça", corredor: "D", prateleira: "2", currentStock: 15, minStock: 40, batch: "L2024-08", status: "Crítico" },
  { id: "9", code: "TEC-003", description: "Tecido Chenille Marrom", category: "Tecidos", unit: "metro", tonalidade: "Marrom", corredor: "A", prateleira: "3", currentStock: 180, minStock: 40, batch: "L2024-09", status: "Normal" },
  { id: "10", code: "FER-003", description: "Parafuso Sextavado M8", category: "Ferragens", unit: "peça", corredor: "D", prateleira: "3", currentStock: 500, minStock: 100, batch: "L2024-10", status: "Normal" },
  { id: "11", code: "ESP-003", description: "Espuma D28 8cm", category: "Espumas", unit: "peça", densidade: "D28", corredor: "B", prateleira: "3", currentStock: 42, minStock: 40, batch: "L2024-11", status: "Baixo" },
  { id: "12", code: "MAD-003", description: "Compensado 10mm", category: "Madeiras", unit: "peça", corredor: "C", prateleira: "3", currentStock: 60, minStock: 20, batch: "L2024-12", status: "Normal" },
];

export const movements: Movement[] = [
  { id: "MOV-001", productId: "1", productName: "Tecido Suede Cinza", type: "Entrada", quantity: 100, date: "2026-03-27", operator: "Carlos Silva", notes: "Compra fornecedor ABC" },
  { id: "MOV-002", productId: "4", productName: "Espuma D45 15cm", type: "Saída", quantity: 12, date: "2026-03-26", operator: "Ana Santos", notes: "Produção lote #45" },
  { id: "MOV-003", productId: "7", productName: "Dobradiça Sofá-Cama", type: "Entrada", quantity: 50, date: "2026-03-25", operator: "Carlos Silva" },
  { id: "MOV-004", productId: "2", productName: "Tecido Linho Bege", type: "Saída", quantity: 20, date: "2026-03-25", operator: "Maria Oliveira", notes: "Produção lote #44" },
  { id: "MOV-005", productId: "5", productName: "Pinus Tratado 2m", type: "Transferência", quantity: 10, date: "2026-03-24", operator: "João Pereira", locationOrigin: "C-1", locationDestiny: "C-3" },
  { id: "MOV-006", productId: "8", productName: "Mola Espiral 12cm", type: "Saída", quantity: 25, date: "2026-03-24", operator: "Ana Santos", notes: "Produção lote #43" },
  { id: "MOV-007", productId: "3", productName: "Espuma D33 10cm", type: "Entrada", quantity: 60, date: "2026-03-23", operator: "Carlos Silva", notes: "Reposição" },
  { id: "MOV-008", productId: "10", productName: "Parafuso Sextavado M8", type: "Ajuste", quantity: -5, date: "2026-03-23", operator: "Maria Oliveira", notes: "Ajuste inventário" },
  { id: "MOV-009", productId: "9", productName: "Tecido Chenille Marrom", type: "Saída", quantity: 30, date: "2026-03-22", operator: "João Pereira" },
  { id: "MOV-010", productId: "6", productName: "MDF 15mm 2,75x1,84", type: "Entrada", quantity: 20, date: "2026-03-22", operator: "Carlos Silva", notes: "Compra fornecedor XYZ" },
  { id: "MOV-011", productId: "1", productName: "Tecido Suede Cinza", type: "Saída", quantity: 40, date: "2026-03-21", operator: "Ana Santos" },
  { id: "MOV-012", productId: "7", productName: "Dobradiça Sofá-Cama", type: "Saída", quantity: 30, date: "2026-03-20", operator: "Maria Oliveira" },
];

export const stockBalances: StockBalance[] = products.map((p) => ({
  id: p.id,
  productName: p.description,
  productCode: p.code,
  batch: p.batch || "-",
  location: `${p.corredor}-${p.prateleira}`,
  currentBalance: p.currentStock,
  lastUpdated: "2026-03-27",
}));

export const invoices: Invoice[] = [
  { id: "NF-001", supplierClient: "Têxtil Brasil Ltda", type: "Entrada", value: 15200.0, date: "2026-03-27", status: "Pago" },
  { id: "NF-002", supplierClient: "Espumas Confort SA", type: "Entrada", value: 8750.0, date: "2026-03-25", status: "Pendente" },
  { id: "NF-003", supplierClient: "Loja Casa & Estilo", type: "Saída", value: 32400.0, date: "2026-03-24", status: "Pago" },
  { id: "NF-004", supplierClient: "Madeireira São Paulo", type: "Entrada", value: 6300.0, date: "2026-03-23", status: "Pago" },
  { id: "NF-005", supplierClient: "Atacadão Móveis", type: "Saída", value: 28900.0, date: "2026-03-22", status: "Pendente" },
  { id: "NF-006", supplierClient: "Ferragens Industrial", type: "Entrada", value: 4200.0, date: "2026-03-21", status: "Cancelado" },
  { id: "NF-007", supplierClient: "Rede Decor", type: "Saída", value: 18500.0, date: "2026-03-20", status: "Pago" },
  { id: "NF-008", supplierClient: "Tecidos Premium", type: "Entrada", value: 11800.0, date: "2026-03-19", status: "Pago" },
  { id: "NF-009", supplierClient: "Magazine Lar", type: "Saída", value: 22100.0, date: "2026-03-18", status: "Pago" },
  { id: "NF-010", supplierClient: "Espumas Norte", type: "Entrada", value: 5600.0, date: "2026-03-17", status: "Pendente" },
  { id: "NF-011", supplierClient: "Construtora Alfa", type: "Saída", value: 41200.0, date: "2026-03-16", status: "Pago" },
  { id: "NF-012", supplierClient: "MadeiraBom", type: "Entrada", value: 7800.0, date: "2026-03-15", status: "Pago" },
];

export const alerts: Alert[] = [
  { id: "ALR-001", title: "Espuma D45 15cm - Estoque Crítico", description: "Apenas 8 unidades restantes. Mínimo: 20 unidades.", severity: "Crítico", type: "Estoque Baixo", date: "2026-03-27", resolved: false },
  { id: "ALR-002", title: "Mola Espiral 12cm - Estoque Crítico", description: "Apenas 15 unidades restantes. Mínimo: 40 unidades.", severity: "Crítico", type: "Estoque Baixo", date: "2026-03-27", resolved: false },
  { id: "ALR-003", title: "Tecido Linho Bege - Estoque Baixo", description: "30 metros restantes. Mínimo: 50 metros.", severity: "Alerta", type: "Estoque Baixo", date: "2026-03-26", resolved: false },
  { id: "ALR-004", title: "Espuma D28 8cm - Estoque Baixo", description: "42 peças restantes. Mínimo: 40 peças.", severity: "Alerta", type: "Estoque Baixo", date: "2026-03-26", resolved: false },
  { id: "ALR-005", title: "Lote L2024-02 - Produto Próximo ao Vencimento", description: "Tecido Linho Bege do lote L2024-02 vence em 15 dias.", severity: "Alerta", type: "Produto Vencendo", date: "2026-03-25", resolved: false },
  { id: "ALR-006", title: "Movimentação Anômala Detectada", description: "Saída de 25 unidades de Mola Espiral em um único dia. Acima da média.", severity: "Info", type: "Movimentação Anômala", date: "2026-03-24", resolved: false },
  { id: "ALR-007", title: "Reposição de Tecido Suede Pendente", description: "Pedido de reposição #PR-112 ainda não foi confirmado.", severity: "Info", type: "Estoque Baixo", date: "2026-03-23", resolved: true },
];

export const chartStockMovements = [
  { month: "Out", entradas: 120, saidas: 95 },
  { month: "Nov", entradas: 145, saidas: 110 },
  { month: "Dez", entradas: 98, saidas: 130 },
  { month: "Jan", entradas: 160, saidas: 105 },
  { month: "Fev", entradas: 135, saidas: 120 },
  { month: "Mar", entradas: 150, saidas: 115 },
];

export const chartStockByCategory = [
  { name: "Tecidos", value: 460, fill: "hsl(217, 91%, 60%)" },
  { name: "Espumas", value: 170, fill: "hsl(142, 71%, 45%)" },
  { name: "Madeiras", value: 190, fill: "hsl(38, 92%, 50%)" },
  { name: "Ferragens", value: 715, fill: "hsl(0, 84%, 60%)" },
];

export const chartRevenueExpenses = [
  { month: "Out", receita: 68000, despesa: 42000 },
  { month: "Nov", receita: 75000, despesa: 38000 },
  { month: "Dez", receita: 82000, despesa: 55000 },
  { month: "Jan", receita: 71000, despesa: 44000 },
  { month: "Fev", receita: 90000, despesa: 48000 },
  { month: "Mar", receita: 85000, despesa: 46000 },
];
