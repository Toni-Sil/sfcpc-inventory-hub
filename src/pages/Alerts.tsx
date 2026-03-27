import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from "lucide-react";
import { alerts as initialAlerts, type Alert } from "@/data/mock-data";
import { formatDate } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";

const severityConfig: Record<string, { icon: typeof AlertTriangle; badge: string }> = {
  Crítico: { icon: AlertCircle, badge: "bg-destructive/10 text-destructive border-destructive/20" },
  Alerta: { icon: AlertTriangle, badge: "bg-warning/10 text-warning border-warning/20" },
  Info: { icon: Info, badge: "bg-info/10 text-info border-info/20" },
};

export default function Alerts() {
  const { toast } = useToast();
  const [alertsList, setAlertsList] = useState<Alert[]>(initialAlerts);

  const resolve = (id: string) => {
    setAlertsList((prev) => prev.map((a) => (a.id === id ? { ...a, resolved: true } : a)));
    toast({ title: "Alerta marcado como resolvido!" });
  };

  const active = alertsList.filter((a) => !a.resolved);
  const resolved = alertsList.filter((a) => a.resolved);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Alertas</h1>
      <div className="space-y-3">
        {active.length === 0 && <p className="text-muted-foreground">Nenhum alerta ativo.</p>}
        {active.map((a) => {
          const config = severityConfig[a.severity];
          const Icon = config.icon;
          return (
            <Card key={a.id}>
              <CardContent className="flex items-start gap-4 py-4">
                <Icon className="h-5 w-5 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{a.title}</span>
                    <Badge variant="outline" className={config.badge}>{a.severity}</Badge>
                    <Badge variant="outline">{a.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{a.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(a.date)}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => resolve(a.id)}>Resolver</Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {resolved.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-muted-foreground">Resolvidos</h2>
          <div className="space-y-3">
            {resolved.map((a) => (
              <Card key={a.id} className="opacity-60">
                <CardContent className="flex items-start gap-4 py-4">
                  <CheckCircle2 className="h-5 w-5 mt-0.5 text-success shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{a.title}</span>
                    <p className="text-sm text-muted-foreground mt-1">{a.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
