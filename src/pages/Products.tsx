import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProducts, useCreateProduct, useDeleteProduct } from "@/hooks/use-api";
import type { ProductSchema } from "@/lib/api";

const statusBadge = (status?: string) => {
  const map: Record<string, string> = {
    Normal: "bg-success/10 text-success border-success/20",
    Baixo: "bg-warning/10 text-warning border-warning/20",
    Crítico: "bg-destructive/10 text-destructive border-destructive/20",
  };
  return map[status ?? ""] ?? "";
};

const categories = ["Tecidos", "Espumas", "Madeiras", "Ferragens"] as const;
const units = ["metro", "peça", "kg"] as const;
const statuses = ["Normal", "Baixo", "Crítico"] as const;

const emptyForm = {
  code: "", description: "", category: "Tecidos", unit: "metro",
  tonalidade: "", densidade: "", metragem: "", corredor: "", prateleira: "",
  validity: "", batch: "",
};

export default function Products() {
  const { toast } = useToast();
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const { data: rawProducts = [], isLoading, isError } = useProducts(200, 0);
  const createProduct = useCreateProduct();
  const deleteProduct = useDeleteProduct();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Client-side filter on already fetched data
  const filtered = rawProducts.filter(
    (p) =>
      (categoryFilter === "all" || p.category === categoryFilter) &&
      (statusFilter === "all" || p.status === statusFilter)
  );
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.code.trim()) e.code = "Código é obrigatório";
    if (!form.description.trim()) e.description = "Descrição é obrigatória";
    if (!form.corredor.trim()) e.corredor = "Corredor é obrigatório";
    if (!form.prateleira.trim()) e.prateleira = "Prateleira é obrigatória";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openAdd = () => {
    setForm({ ...emptyForm });
    setErrors({});
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      await createProduct.mutateAsync(form as ProductSchema);
      toast({ title: "Produto cadastrado com sucesso!" });
      setDialogOpen(false);
    } catch (err) {
      toast({
        title: "Erro ao cadastrar produto",
        description: err instanceof Error ? err.message : "Tente novamente",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (code: string) => {
    try {
      await deleteProduct.mutateAsync(code);
      toast({ title: "Produto excluído com sucesso!", variant: "destructive" });
    } catch (err) {
      toast({
        title: "Erro ao excluir produto",
        description: err instanceof Error ? err.message : "Tente novamente",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" />Adicionar Produto</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Novo Produto</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Código *</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />{errors.code && <p className="text-xs text-destructive mt-1">{errors.code}</p>}</div>
                <div><Label>Categoria *</Label><Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div><Label>Descrição *</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />{errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}</div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Unidade *</Label><Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{units.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Tonalidade</Label><Input value={form.tonalidade} onChange={(e) => setForm({ ...form, tonalidade: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Densidade</Label><Input value={form.densidade} onChange={(e) => setForm({ ...form, densidade: e.target.value })} /></div>
                <div><Label>Metragem</Label><Input value={form.metragem} onChange={(e) => setForm({ ...form, metragem: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Corredor *</Label><Input value={form.corredor} onChange={(e) => setForm({ ...form, corredor: e.target.value })} />{errors.corredor && <p className="text-xs text-destructive mt-1">{errors.corredor}</p>}</div>
                <div><Label>Prateleira *</Label><Input value={form.prateleira} onChange={(e) => setForm({ ...form, prateleira: e.target.value })} />{errors.prateleira && <p className="text-xs text-destructive mt-1">{errors.prateleira}</p>}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Data de Validade</Label><Input type="date" value={form.validity} onChange={(e) => setForm({ ...form, validity: e.target.value })} /></div>
                <div><Label>Lote</Label><Input value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })} /></div>
              </div>
            </div>
            <DialogFooter><Button onClick={handleSave} disabled={createProduct.isPending}>{createProduct.isPending ? "Salvando..." : "Cadastrar"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isError && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4 text-destructive text-sm">
          Erro ao carregar produtos. Verifique a conexão com o backend.
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Categoria" /></SelectTrigger><SelectContent><SelectItem value="all">Todas Categorias</SelectItem>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Todos Status</SelectItem>{statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 rounded bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((p) => (
                    <TableRow key={p.code}>
                      <TableCell className="font-mono text-sm">{p.code}</TableCell>
                      <TableCell>{p.description}</TableCell>
                      <TableCell>{p.category}</TableCell>
                      <TableCell>{p.unit}</TableCell>
                      <TableCell>{p.corredor}-{p.prateleira}</TableCell>
                      <TableCell>{p.current_stock ?? 0}</TableCell>
                      <TableCell><Badge variant="outline" className={statusBadge(p.status)}>{p.status ?? "Normal"}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(p.code)} disabled={deleteProduct.isPending}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paged.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        Nenhum produto encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="flex items-center justify-end gap-2 pt-4">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</Button>
                  <span className="text-sm text-muted-foreground">Página {page + 1} de {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Próxima</Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
