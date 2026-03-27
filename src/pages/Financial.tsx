import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { invoices, chartRevenueExpenses, type Invoice } from "@/data/mock-data";
import { formatCurrency, formatDate } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Pago: "bg-success/10 text-success border-success/20",
    Pendente: "bg-warning/10 text-warning border-warning/20",
    Cancelado: "bg-destructive/10 text-destructive border-destructive/20",
  };
  return map[status] || "";
};

export default function Financial() {
  const { toast } = useToast();
  const [data, setData] = useState<Invoice[]>(invoices);
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ supplierClient: "", type: "Entrada", value: "", status: "Pendente" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalReceita = data.filter((i) => i.type === "Saída" && i.status === "Pago").reduce((s, i) => s + i.value, 0);
  const totalDespesa = data.filter((i) => i.type === "Entrada" && i.status === "Pago").reduce((s, i) => s + i.value, 0);

  const pageSize = 10;
  const totalPages = Math.ceil(data.length / pageSize);
  const paged = data.slice(page * pageSize, (page + 1) * pageSize);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.supplierClient.trim()) e.supplierClient = "Fornecedor/Cliente é obrigatório";
    if (!form.value || Number(form.value) <= 0) e.value = "Valor deve ser maior que zero";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const newInv: Invoice = {
      id: `NF-${String(Date.now()).slice(-6)}`,
      supplierClient: form.supplierClient,
      type: form.type as Invoice["type"],
      value: Number(form.value),
      date: new Date().toISOString().slice(0, 10),
      status: form.status as Invoice["status"],
    };
    setData((prev) => [newInv, ...prev]);
    setDialogOpen(false);
    toast({ title: "Nota fiscal cadastrada com sucesso!" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Financeiro</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setForm({ supplierClient: "", type: "Entrada", value: "", status: "Pendente" }); setErrors({}); }}>
              <Plus className="mr-2 h-4 w-4" />Adicionar Nota
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova Nota Fiscal</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div><Label>Fornecedor/Cliente *</Label><Input value={form.supplierClient} onChange={(e) => setForm({ ...form, supplierClient: e.target.value })} />{errors.supplierClient && <p className="text-xs text-destructive mt-1">{errors.supplierClient}</p>}</div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Tipo *</Label><Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Entrada">Entrada</SelectItem><SelectItem value="Saída">Saída</SelectItem></SelectContent></Select></div>
                <div><Label>Valor (R$) *</Label><Input type="number" step="0.01" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />{errors.value && <p className="text-xs text-destructive mt-1">{errors.value}</p>}</div>
              </div>
              <div><Label>Status</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Pago">Pago</SelectItem><SelectItem value="Pendente">Pendente</SelectItem><SelectItem value="Cancelado">Cancelado</SelectItem></SelectContent></Select></div>
            </div>
            <DialogFooter><Button onClick={handleSave}>Cadastrar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Receita do Mês</CardTitle><TrendingUp className="h-4 w-4 text-success" /></CardHeader><CardContent><div className="text-2xl font-bold text-success">{formatCurrency(totalReceita)}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Despesas do Mês</CardTitle><TrendingDown className="h-4 w-4 text-destructive" /></CardHeader><CardContent><div className="text-2xl font-bold text-destructive">{formatCurrency(totalDespesa)}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Saldo Líquido</CardTitle><DollarSign className="h-4 w-4 text-primary" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(totalReceita - totalDespesa)}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Receita vs Despesas</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartRevenueExpenses}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend />
              <Line type="monotone" dataKey="receita" name="Receita" stroke="hsl(142, 71%, 45%)" strokeWidth={2} />
              <Line type="monotone" dataKey="despesa" name="Despesas" stroke="hsl(0, 84%, 60%)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Fornecedor/Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-mono text-sm">{i.id}</TableCell>
                  <TableCell>{i.supplierClient}</TableCell>
                  <TableCell><Badge variant="outline" className={i.type === "Entrada" ? "bg-info/10 text-info border-info/20" : "bg-success/10 text-success border-success/20"}>{i.type}</Badge></TableCell>
                  <TableCell>{formatCurrency(i.value)}</TableCell>
                  <TableCell>{formatDate(i.date)}</TableCell>
                  <TableCell><Badge variant="outline" className={statusBadge(i.status)}>{i.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 pt-4">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</Button>
              <span className="text-sm text-muted-foreground">Página {page + 1} de {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Próxima</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
