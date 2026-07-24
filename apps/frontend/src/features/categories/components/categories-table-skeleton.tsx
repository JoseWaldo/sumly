import { Skeleton } from "@/components/ui/skeleton";

function TableHeaderSkeleton() {
  return (
    <thead>
      <tr className="border-b border-border/30">
        <th className="px-4 py-3" style={{ width: 48 }} />
        <th className="px-4 py-3">
          <Skeleton className="h-3.5 w-16" />
        </th>
        <th className="px-4 py-3">
          <Skeleton className="h-3.5 w-10" />
        </th>
        <th className="px-4 py-3">
          <Skeleton className="h-3.5 w-14" />
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
        <Skeleton className="h-4 w-4 rounded" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-28" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-5 w-16 rounded-md" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-3.5 w-20" />
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

export function CategoriesTableSkeleton() {
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
    </div>
  );
}
