import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, TrendingUp, TrendingDown, DollarSign, CalendarClock, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { invoices, chartRevenueExpenses, type Invoice } from "@/data/mock-data";
import { formatCurrency, formatDate } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import { differenceInDays, parseISO, isSameDay } from "date-fns";

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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const totalReceita = data.filter((i) => i.type === "Saída" && i.status === "Pago").reduce((s, i) => s + i.value, 0);
  const totalDespesa = data.filter((i) => i.type === "Entrada" && i.status === "Pago").reduce((s, i) => s + i.value, 0);

  const pageSize = 10;
  const totalPages = Math.ceil(data.length / pageSize);
  const paged = data.slice(page * pageSize, (page + 1) * pageSize);

  // Due dates logic
  const today = new Date();
  const pendingInvoices = useMemo(() => data.filter((i) => i.status === "Pendente"), [data]);

  const dueDates = useMemo(() => pendingInvoices.map((i) => parseISO(i.dueDate)), [pendingInvoices]);

  const upcomingDue = useMemo(() => {
    return pendingInvoices
      .map((i) => ({ ...i, daysLeft: differenceInDays(parseISO(i.dueDate), today) }))
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [pendingInvoices, today]);

  const invoicesOnSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return pendingInvoices.filter((i) => isSameDay(parseISO(i.dueDate), selectedDate));
  }, [selectedDate, pendingInvoices]);

  const modifiers = useMemo(() => {
    const urgent: Date[] = [];
    const warning: Date[] = [];
    const normal: Date[] = [];
    pendingInvoices.forEach((i) => {
      const d = parseISO(i.dueDate);
      const days = differenceInDays(d, today);
      if (days <= 3) urgent.push(d);
      else if (days <= 7) warning.push(d);
      else normal.push(d);
    });
    return { urgent, warning, normal };
  }, [pendingInvoices, today]);

  const modifiersStyles = {
    urgent: { backgroundColor: "hsl(var(--destructive))", color: "hsl(var(--destructive-foreground))", borderRadius: "50%" },
    warning: { backgroundColor: "hsl(var(--warning))", color: "hsl(var(--background))", borderRadius: "50%" },
    normal: { backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", borderRadius: "50%" },
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.supplierClient.trim()) e.supplierClient = "Fornecedor/Cliente é obrigatório";
    if (!form.value || Number(form.value) <= 0) e.value = "Valor deve ser maior que zero";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const dateStr = new Date().toISOString().slice(0, 10);
    const dueDateStr = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
    const newInv: Invoice = {
      id: `NF-${String(Date.now()).slice(-6)}`,
      supplierClient: form.supplierClient,
      type: form.type as Invoice["type"],
      value: Number(form.value),
      date: dateStr,
      dueDate: dueDateStr,
      status: form.status as Invoice["status"],
    };
    setData((prev) => [newInv, ...prev]);
    setDialogOpen(false);
    toast({ title: "Nota fiscal cadastrada com sucesso!" });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-bold">Financeiro</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto" onClick={() => { setForm({ supplierClient: "", type: "Entrada", value: "", status: "Pendente" }); setErrors({}); }}>
              <Plus className="mr-2 h-4 w-4" />Adicionar Nota
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-md">
            <DialogHeader><DialogTitle>Nova Nota Fiscal</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Fornecedor/Cliente *</Label>
                <Input value={form.supplierClient} onChange={(e) => setForm({ ...form, supplierClient: e.target.value })} />
                {errors.supplierClient && <p className="text-xs text-destructive mt-1">{errors.supplierClient}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Tipo *</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Entrada">Entrada</SelectItem><SelectItem value="Saída">Saída</SelectItem></SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Valor (R$) *</Label>
                  <Input type="number" step="0.01" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
                  {errors.value && <p className="text-xs text-destructive mt-1">{errors.value}</p>}
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Pago">Pago</SelectItem><SelectItem value="Pendente">Pendente</SelectItem><SelectItem value="Cancelado">Cancelado</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter><Button onClick={handleSave} className="w-full sm:w-auto">Cadastrar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Receita do Mês</CardTitle>
            <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
          </CardHeader>
          <CardContent><div className="text-xl sm:text-2xl font-bold text-success">{formatCurrency(totalReceita)}</div></CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Despesas do Mês</CardTitle>
            <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent><div className="text-xl sm:text-2xl font-bold text-destructive">{formatCurrency(totalDespesa)}</div></CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Saldo Líquido</CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent><div className="text-xl sm:text-2xl font-bold">{formatCurrency(totalReceita - totalDespesa)}</div></CardContent>
        </Card>
      </div>

      {/* Calendar + Upcoming Due */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" />
              Calendário de Vencimentos
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center pb-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className="p-2 pointer-events-auto w-full max-w-[320px]"
            />
            {invoicesOnSelectedDate.length > 0 && (
              <div className="mt-3 w-full space-y-2">
                <p className="text-xs font-medium text-muted-foreground px-1">Vencimentos neste dia:</p>
                {invoicesOnSelectedDate.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between rounded-lg border p-2.5 text-sm">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{inv.supplierClient}</p>
                      <p className="text-xs text-muted-foreground">{inv.id}</p>
                    </div>
                    <span className="font-semibold text-destructive ml-2 whitespace-nowrap">{formatCurrency(inv.value)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Próximos Vencimentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[320px] pr-3">
              {upcomingDue.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma conta pendente 🎉</p>
              ) : (
                <div className="space-y-2.5">
                  {upcomingDue.map((inv) => {
                    const isUrgent = inv.daysLeft <= 3;
                    const isWarning = inv.daysLeft > 3 && inv.daysLeft <= 7;
                    return (
                      <div
                        key={inv.id}
                        className={`rounded-lg border p-3 transition-colors ${
                          isUrgent ? "border-destructive/40 bg-destructive/5" : isWarning ? "border-warning/40 bg-warning/5" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">{inv.supplierClient}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {inv.id} • Vence {formatDate(inv.dueDate)}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-semibold text-sm">{formatCurrency(inv.value)}</p>
                            <Badge
                              variant="outline"
                              className={`text-[10px] mt-1 ${
                                isUrgent
                                  ? "bg-destructive/10 text-destructive border-destructive/20"
                                  : isWarning
                                  ? "bg-warning/10 text-warning border-warning/20"
                                  : "bg-primary/10 text-primary border-primary/20"
                              }`}
                            >
                              {inv.daysLeft <= 0 ? "Vencido!" : inv.daysLeft === 1 ? "Amanhã" : `${inv.daysLeft} dias`}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm sm:text-base">Receita vs Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartRevenueExpenses}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="receita" name="Receita" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="despesa" name="Despesas" stroke="hsl(0, 84%, 60%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Table - mobile card view */}
      <Card>
        <CardContent className="pt-6">
          {/* Desktop table */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Fornecedor/Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-mono text-sm">{i.id}</TableCell>
                    <TableCell>{i.supplierClient}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={i.type === "Entrada" ? "bg-info/10 text-info border-info/20" : "bg-success/10 text-success border-success/20"}>
                        {i.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(i.value)}</TableCell>
                    <TableCell>{formatDate(i.dueDate)}</TableCell>
                    <TableCell><Badge variant="outline" className={statusBadge(i.status)}>{i.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile card list */}
          <div className="sm:hidden space-y-3">
            {paged.map((i) => (
              <div key={i.id} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">{i.id}</span>
                  <Badge variant="outline" className={statusBadge(i.status)}>{i.status}</Badge>
                </div>
                <p className="font-medium text-sm">{i.supplierClient}</p>
                <div className="flex items-center justify-between text-sm">
                  <Badge variant="outline" className={i.type === "Entrada" ? "bg-info/10 text-info border-info/20" : "bg-success/10 text-success border-success/20"}>
                    {i.type}
                  </Badge>
                  <span className="font-semibold">{formatCurrency(i.value)}</span>
                </div>
                <p className="text-xs text-muted-foreground">Vence: {formatDate(i.dueDate)}</p>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between sm:justify-end gap-2 pt-4">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</Button>
              <span className="text-xs sm:text-sm text-muted-foreground">Página {page + 1} de {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Próxima</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
