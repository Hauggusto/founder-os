import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function GreetingHeader() {
  const now = new Date();
  const formattedDate = format(now, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-foreground mb-1">
        Bom te ver, Hauggusto
      </h1>
      <p className="text-sm text-muted-foreground capitalize">
        {formattedDate}
      </p>
    </div>
  );
}
