import { Skeleton } from "@/components/ui/skeleton";

function CardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-border/30 bg-card p-5">
      <div className="mb-1 flex items-start justify-between">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-7 w-7 rounded-md" />
      </div>

      <Skeleton className="mb-3 h-8 w-28" />

      <div className="mb-3 flex gap-1.5">
        <Skeleton className="h-5 w-16 rounded-md" />
        <Skeleton className="h-5 w-14 rounded-md" />
      </div>

      <div className="flex items-center gap-1.5">
        <Skeleton className="h-3.5 w-3.5" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="mt-3 flex gap-1.5">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
    </div>
  );
}

const CARD_COUNT = 6;

export function SubscriptionCardSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: CARD_COUNT }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
