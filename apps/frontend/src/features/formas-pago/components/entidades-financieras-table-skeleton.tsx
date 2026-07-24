export function EntidadesFinancierasTableSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="overflow-x-auto max-w-[calc(100vw-2rem)] md:max-w-none">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/30">
              <th className="px-4 py-3"><div className="h-4 w-8 rounded bg-muted-foreground/20" /></th>
              <th className="px-4 py-3"><div className="h-4 w-16 rounded bg-muted-foreground/20" /></th>
              <th className="px-4 py-3"><div className="h-4 w-12 rounded bg-muted-foreground/20" /></th>
              <th className="px-4 py-3"><div className="h-4 w-12 rounded bg-muted-foreground/20" /></th>
              <th className="px-4 py-3"><div className="h-4 w-8 rounded bg-muted-foreground/20" /></th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-border/20 last:border-0">
                <td className="px-4 py-3"><div className="h-8 w-8 rounded-md bg-muted-foreground/20" /></td>
                <td className="px-4 py-3"><div className="h-4 w-24 rounded bg-muted-foreground/20" /></td>
                <td className="px-4 py-3"><div className="h-4 w-28 rounded bg-muted-foreground/20" /></td>
                <td className="px-4 py-3"><div className="h-4 w-20 rounded bg-muted-foreground/20" /></td>
                <td className="px-4 py-3" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
