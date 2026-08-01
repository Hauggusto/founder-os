import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function QuickCapture() {
  const { quickCaptures, addQuickCapture } = useAppStore();
  const [text, setText] = useState('');

  const handleAdd = () => {
    if (text.trim()) {
      addQuickCapture(text);
      setText('');
    }
  };

  return (
    <div className="bg-card border border-card-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Captura Rápida
      </h3>
      
      <div className="space-y-3 mb-4">
        <Textarea
          placeholder="Anote uma ideia, tarefa ou pensamento rápido..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="bg-background border-input resize-none min-h-[100px] text-sm"
          data-testid="textarea-quick-capture"
        />
        <Button
          onClick={handleAdd}
          className="w-full bg-primary hover:bg-primary/90"
          data-testid="button-add-capture"
        >
          Adicionar
        </Button>
      </div>

      <div className="space-y-2 max-h-[200px] overflow-y-auto">
        {quickCaptures.slice(0, 5).map((capture) => (
          <div
            key={capture.id}
            className="p-3 bg-background rounded border border-border"
            data-testid={`capture-${capture.id}`}
          >
            <p className="text-sm text-foreground mb-1">{capture.text}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(capture.createdAt), {
                addSuffix: true,
                locale: ptBR,
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
