import { Skeleton } from './ui/skeleton';
import { Card } from './ui/card';

export function PageSkeleton({ detail = false }: { detail?: boolean }) {
  return <main aria-busy="true" aria-label="Loading page" className="mx-auto max-w-7xl px-5 py-16 md:py-20 lg:px-8 lg:py-24">
    <p role="status" className="sr-only">Loading content…</p>
    <Skeleton className="h-4 w-32" />
    <Skeleton className="mt-5 h-14 max-w-2xl" />
    <Skeleton className="mt-5 h-5 max-w-lg" />
    {detail ? <Card className="mt-10 space-y-5"><Skeleton className="aspect-[16/9] max-h-80 w-full" /><Skeleton className="h-6 w-2/3" /><Skeleton className="h-24 w-full" /></Card> :
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <Card key={index} padding="none" className="overflow-hidden"><Skeleton className="aspect-[16/9] rounded-none" /><div className="space-y-4 p-6"><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></div></Card>)}</div>}
  </main>;
}
