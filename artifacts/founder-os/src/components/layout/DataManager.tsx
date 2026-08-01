import { useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function DataManager() {
  const { exportData, importData } = useAppStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `founder-os-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Dados exportados',
      description: 'Backup criado com sucesso.',
    });
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const success = importData(json);
        
        if (success) {
          toast({
            title: 'Dados importados',
            description: 'Backup restaurado com sucesso.',
          });
          window.location.reload();
        } else {
          toast({
            title: 'Erro',
            description: 'Arquivo inválido ou corrompido.',
            variant: 'destructive',
          });
        }
      } catch (err) {
        toast({
          title: 'Erro',
          description: 'Não foi possível importar o arquivo.',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        className="border-border text-foreground"
        data-testid="button-export-data"
      >
        <Download className="w-4 h-4 mr-2" />
        Exportar
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleImport}
        className="border-border text-foreground"
        data-testid="button-import-data"
      >
        <Upload className="w-4 h-4 mr-2" />
        Importar
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
