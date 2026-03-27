import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/hooks/use-theme";

export default function SettingsPage() {
  const { theme, toggle } = useTheme();

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Configurações</h1>

      <Card>
        <CardHeader><CardTitle className="text-base">Perfil</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Nome</Label><Input defaultValue="Carlos Silva" /></div>
            <div><Label>E-mail</Label><Input defaultValue="admin@sfcpc.com.br" /></div>
          </div>
          <div><Label>Cargo</Label><Input defaultValue="Administrador" disabled /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Empresa</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Nome da Empresa</Label><Input defaultValue="S.F.C.P.C" disabled /></div>
            <div><Label>Plano</Label><Input defaultValue="Profissional" disabled /></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Aparência</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Modo Escuro</p>
              <p className="text-sm text-muted-foreground">Alternar entre tema claro e escuro</p>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={toggle} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Usuários e Permissões</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground">Gerenciamento de usuários disponível em breve.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Integrações (API)</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground">Configurações de API disponíveis em breve.</p></CardContent>
      </Card>
    </div>
  );
}
