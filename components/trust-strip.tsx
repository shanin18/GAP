import { Badge } from './ui/badge';

const items = ['Human-led guidance', 'Clear next steps', 'Trusted destinations'];

export function TrustStrip() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((item) => <Badge key={item}>{item}</Badge>)}
    </div>
  );
}
