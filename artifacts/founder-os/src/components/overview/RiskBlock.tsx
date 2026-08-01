import { useAppStore } from '@/store/useAppStore';
import { AlertTriangle } from 'lucide-react';

export function RiskBlock() {
  const { risks } = useAppStore();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-[#EF4444] shadow-[0_0_8px_#EF444480]';
      case 'medium': return 'bg-[#F97316]';
      case 'low': return 'bg-[#EAB308]';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="bg-[#1C1514] border border-[#F97316]/20 rounded-lg p-6 relative overflow-hidden">
      {/* subtle gradient bg */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#F97316]/5 blur-3xl rounded-full" />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-sm font-semibold text-[#F97316] uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Área de Risco
        </h3>
      </div>

      <div className="space-y-3 relative z-10">
        {risks.map((risk) => (
          <div key={risk.id} className="flex items-start gap-3 group">
            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${getSeverityColor(risk.severity)}`} />
            <div>
              <p className="text-sm text-foreground/90 font-medium leading-tight mb-1 group-hover:text-foreground transition-colors">
                {risk.title}
              </p>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {risk.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
