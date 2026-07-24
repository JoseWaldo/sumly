export function FormaPagoCardSkeleton() {
  return (
    <div className="flex flex-col justify-between overflow-hidden rounded-xl bg-muted p-5 min-h-[180px] animate-pulse">
      <div className="mt-2">
        <div className="h-5 w-16 rounded-md bg-muted-foreground/20" />
      </div>
      <div className="mt-3">
        <div className="h-5 w-32 rounded bg-muted-foreground/20" />
      </div>
      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-40 rounded bg-muted-foreground/20" />
          <div className="flex gap-1">
            <div className="h-7 w-7 rounded-md bg-muted-foreground/20" />
            <div className="h-7 w-7 rounded-md bg-muted-foreground/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
