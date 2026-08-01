import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlaceholderProps {
  title: string;
  description: string;
}

export default function Placeholder({ title, description }: PlaceholderProps) {
  return (
    <div className="max-w-[1600px] min-h-[70vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-card border border-card-border flex items-center justify-center mx-auto mb-6">
          <Package className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
          {description}
        </p>
        <Button variant="outline" className="border-border text-foreground">
          Em breve
        </Button>
      </div>
    </div>
  );
}
