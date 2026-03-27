import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download } from "lucide-react";
import { stockBalances } from "@/data/mock-data";
import { formatDate } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";

export default function StockBalance() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const filtered = stockBalances.filter(
    (s) => s.productName.toLowerCase().includes(search.toLowerCase()) || s.productCode.toLowerCase().includes(search.toLowerCase())
  );
  const pageSize = 10;
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const exportCSV = () => {
    const header = "Produto,Código,Lote,Localização,Saldo,Última Atualização\n";
    const rows = stockBalances.map((s) => `${s.productName},${s.productCode},${s.batch},${s.location},${s.currentBalance},${formatDate(s.lastUpdated)}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "saldo-estoque.csv"; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Arquivo CSV exportado com sucesso!" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Saldo de Estoque</h1>
        <Button variant="outline" onClick={exportCSV}><Download className="mr-2 h-4 w-4" />Exportar CSV</Button>
      </div>

      <Card>
        <CardHeader>
          <Input placeholder="Buscar por produto ou código..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} className="max-w-sm" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Lote</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Saldo Atual</TableHead>
                <TableHead>Última Atualização</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.productName}</TableCell>
                  <TableCell className="font-mono text-sm">{s.productCode}</TableCell>
                  <TableCell>{s.batch}</TableCell>
                  <TableCell>{s.location}</TableCell>
                  <TableCell>{s.currentBalance}</TableCell>
                  <TableCell>{formatDate(s.lastUpdated)}</TableCell>
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
