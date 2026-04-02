import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { movements, products, type Movement } from "@/data/mock-data";
import { formatDate } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import { AIMovementInput } from "@/components/AIMovementInput";

const movementTypes = ["Entrada", "Saída", "Transferência", "Ajuste"] as const;

const typeBadge = (type: string) => {
  const map: Record<string, string> = {
    Entrada: "bg-success/10 text-success border-success/20",
    Saída: "bg-destructive/10 text-destructive border-destructive/20",
    Transferência: "bg-info/10 text-info border-info/20",
    Ajuste: "bg-warning/10 text-warning border-warning/20",
  };
  return map[type] || "";
};

export default function Movements() {
  const { toast } = useToast();
  const [data, setData] = useState<Movement[]>(movements);
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ productId: "", type: "Entrada", quantity: "", batch: "", locationOrigin: "", locationDestiny: "", notes: "", operator: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = data.filter((m) => {
    if (typeFilter !== "all" && m.type !== typeFilter) return false;
    if (dateFrom && m.date < dateFrom) return false;
    if (dateTo && m.date > dateTo) return false;
    return true;
  });

  const pageSize = 10;
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.productId) e.productId = "Produto é obrigatório";
    if (!form.quantity || Number(form.quantity) <= 0) e.quantity = "Quantidade deve ser maior que zero";
    if (!form.operator.trim()) e.operator = "Operador é obrigatório";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const product = products.find((p) => p.id === form.productId);
    const newMov: Movement = {
      id: `MOV-${String(Date.now()).slice(-6)}`,
      productId: form.productId,
      productName: product?.description || "",
      type: form.type as Movement["type"],
      quantity: Number(form.quantity),
      date: new Date().toISOString().slice(0, 10),
      operator: form.operator,
      notes: form.notes,
      batch: form.batch,
      locationOrigin: form.locationOrigin,
      locationDestiny: form.locationDestiny,
    };
    setData((prev) => [newMov, ...prev]);
    setDialogOpen(false);
    toast({ title: "Movimentação registrada com sucesso!" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Movimentações</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setForm({ productId: "", type: "Entrada", quantity: "", batch: "", locationOrigin: "", locationDestiny: "", notes: "", operator: "" }); setErrors({}); }}>
              <Plus className="mr-2 h-4 w-4" />Registrar Movimentação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Nova Movimentação</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div><Label>Produto *</Label>
                <Select value={form.productId} onValueChange={(v) => setForm({ ...form, productId: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione um produto" /></SelectTrigger>
                  <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.code} - {p.description}</SelectItem>)}</SelectContent>
                </Select>
                {errors.productId && <p className="text-xs text-destructive mt-1">{errors.productId}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Tipo *</Label><Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{movementTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Quantidade *</Label><Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />{errors.quantity && <p className="text-xs text-destructive mt-1">{errors.quantity}</p>}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Lote</Label><Input value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })} /></div>
                <div><Label>Operador *</Label><Input value={form.operator} onChange={(e) => setForm({ ...form, operator: e.target.value })} />{errors.operator && <p className="text-xs text-destructive mt-1">{errors.operator}</p>}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Local Origem</Label><Input value={form.locationOrigin} onChange={(e) => setForm({ ...form, locationOrigin: e.target.value })} /></div>
                <div><Label>Local Destino</Label><Input value={form.locationDestiny} onChange={(e) => setForm({ ...form, locationDestiny: e.target.value })} /></div>
              </div>
              <div><Label>Observações</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
            <DialogFooter><Button onClick={handleSave}>Registrar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Tipo" /></SelectTrigger><SelectContent><SelectItem value="all">Todos os Tipos</SelectItem>{movementTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
            <Input type="date" className="w-[160px]" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="De" />
            <Input type="date" className="w-[160px]" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="Até" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Qtd</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Operador</TableHead>
                <TableHead>Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-mono text-sm">{m.id}</TableCell>
                  <TableCell>{m.productName}</TableCell>
                  <TableCell><Badge variant="outline" className={typeBadge(m.type)}>{m.type}</Badge></TableCell>
                  <TableCell>{m.quantity}</TableCell>
                  <TableCell>{formatDate(m.date)}</TableCell>
                  <TableCell>{m.operator}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{m.notes || "-"}</TableCell>
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
