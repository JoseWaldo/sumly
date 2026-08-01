import { Card } from "@/components/ui/card";

interface DebtSummaryCardsProps {
  aFavor: number;
  enContra: number;
  isLoading: boolean;
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function DebtSummaryCards({ aFavor, enContra, isLoading }: DebtSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i} className="p-4">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-7 w-28 animate-pulse rounded bg-muted" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Card className="p-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">A favor</p>
        <p className="mt-1 text-xl font-semibold text-emerald-500">{formatMoney(aFavor)}</p>
      </Card>
      <Card className="p-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">En contra</p>
        <p className="mt-1 text-xl font-semibold text-rose-500">{formatMoney(enContra)}</p>
      </Card>
    </div>
  );
}
