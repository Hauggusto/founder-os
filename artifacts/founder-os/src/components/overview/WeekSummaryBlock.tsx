import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Textarea } from '@/components/ui/textarea';

export function WeekSummaryBlock() {
  const { weekSummary, setWeekSummary } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [localText, setLocalText] = useState(weekSummary);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = textareaRef.current.value.length;
    }
  }, [isEditing]);

  const handleBlur = () => {
    setWeekSummary(localText);
    setIsEditing(false);
  };

  return (
    <div className="bg-card border border-card-border rounded-lg p-6 relative">
      <div className="absolute left-6 top-8 bottom-6 w-0.5 bg-[#ffffff0a]" />
      
      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3 ml-4">
        Resumo da Semana
      </h3>

      <div className="ml-4 pl-4 relative">
        <div className="absolute left-[-21px] top-1.5 w-2 h-2 rounded-full bg-primary border-2 border-background" />
        
        {isEditing ? (
          <Textarea
            ref={textareaRef}
            value={localText}
            onChange={(e) => setLocalText(e.target.value)}
            onBlur={handleBlur}
            className="min-h-[100px] text-sm italic text-muted-foreground bg-background border-input resize-none focus-visible:ring-1"
          />
        ) : (
          <p 
            onClick={() => setIsEditing(true)}
            className="text-sm italic text-muted-foreground leading-relaxed cursor-text hover:text-foreground/80 transition-colors min-h-[60px]"
          >
            {weekSummary || "Clique para adicionar o resumo da semana..."}
          </p>
        )}
      </div>
    </div>
  );
}
