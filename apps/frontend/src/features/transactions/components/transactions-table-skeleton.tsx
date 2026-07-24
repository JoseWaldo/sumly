import { Skeleton } from "@/components/ui/skeleton";

function TableHeaderSkeleton() {
  return (
    <thead>
      <tr className="border-b border-border/30">
        <th className="px-4 py-3" style={{ width: 140 }}>
          <Skeleton className="h-3.5 w-12" />
        </th>
        <th className="px-4 py-3" style={{ width: 180 }}>
          <Skeleton className="h-3.5 w-16" />
        </th>
        <th className="px-4 py-3">
          <Skeleton className="h-3.5 w-20" />
        </th>
        <th className="px-4 py-3 text-right" style={{ width: 130 }}>
          <Skeleton className="h-3.5 w-12 ml-auto" />
        </th>
        <th className="px-4 py-3" style={{ width: 80 }} />
      </tr>
    </thead>
  );
}

function TableRowSkeleton() {
  return (
    <tr className="border-b border-border/20 last:border-0">
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-20" />
        </div>
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-32" />
      </td>
      <td className="px-4 py-3 text-right">
        <Skeleton className="h-4 w-16 ml-auto" />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <Skeleton className="h-7 w-7 rounded-md" />
          <Skeleton className="h-7 w-7 rounded-md" />
        </div>
      </td>
    </tr>
  );
}

const ROW_COUNT = 5;

export function TransactionsTableSkeleton() {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <TableHeaderSkeleton />
          <tbody>
            {Array.from({ length: ROW_COUNT }, (_, i) => (
              <TableRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-border/30 px-4 py-3">
        <Skeleton className="h-3 w-40" />
        <div className="flex items-center gap-1">
          <Skeleton className="h-7 w-7 rounded-md" />
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-7 w-7 rounded-md" />
          ))}
          <Skeleton className="h-7 w-7 rounded-md" />
        </div>
      </div>
    </div>
  );
}
