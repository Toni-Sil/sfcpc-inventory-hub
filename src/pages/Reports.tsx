import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, RefreshCw, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const reports = [
  { title: "Curva ABC", description: "Análise de classificação ABC dos produtos por valor de consumo.", icon: BarChart3 },
  { title: "Giro de Estoque", description: "Relatório de rotatividade dos itens em estoque nos últimos 12 meses.", icon: RefreshCw },
  { title: "Resumo Financeiro", description: "Consolidado financeiro com receitas, despesas e margem líquida.", icon: FileSpreadsheet },
];

export default function Reports() {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Relatórios</h1>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {reports.map((r) => (
          <Card key={r.title}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <r.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">{r.title}</CardTitle>
              </div>
              <CardDescription className="mt-2">{r.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => toast({ title: "Relatório gerado com sucesso!" })}>Gerar Relatório</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
