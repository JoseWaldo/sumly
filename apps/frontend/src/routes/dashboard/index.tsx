import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, DollarSign, Wallet, Repeat } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { formatDateCol, formatCurrencyCOP } from "@/lib/date-utils";
import { LazyIcon } from "@/features/categories/components/icon-picker";
import {
  useDashboardSummary,
  useExpensesByCategory,
} from "@/features/transactions/hooks/use-dashboard";
import { useSubscriptionDashboard } from "@/features/subscriptions/hooks/use-subscriptions";
import type { Transaction, ExpenseByCategory } from "@/features/transactions/schemas/transaction.schema";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndex,
});

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload: ExpenseByCategory & { fill: string } }[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-border/30 bg-card px-3 py-2 text-sm shadow-lg">
        <div className="flex items-center gap-1.5 font-medium">
          <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: data.fill }} />
          {data.categoryName}
        </div>
        <p className="mt-0.5 text-muted-foreground">
          {formatCurrencyCOP(data.total)} ({data.percentage}%)
        </p>
      </div>
    );
  }
  return null;
}

function DashboardIndex() {
  const { user } = useAuth();
  const now = new Date();
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: subscriptionDash } = useSubscriptionDashboard();
  const { data: expensesByCategory } = useExpensesByCategory(
    now.getMonth() + 1,
    now.getFullYear()
  );

  const stats = [
    {
      title: "Balance total",
      value: summary ? formatCurrencyCOP(summary.balance) : "$0",
      description: summary ? (summary.balance >= 0 ? "Balance positivo" : "Balance negativo") : "Tu patrimonio actual",
      icon: Wallet,
      accentClass: "border-t-chart-1",
      color: "text-chart-1",
      bg: "bg-chart-1/10",
      valueClass: summary && summary.balance >= 0 ? "text-chart-2" : "text-chart-4",
    },
    {
      title: "Ingresos del mes",
      value: summary ? formatCurrencyCOP(summary.monthlyIncome) : "$0",
      description: "Acumulado del mes",
      icon: ArrowUpRight,
      accentClass: "border-t-chart-2",
      color: "text-chart-2",
      bg: "bg-chart-2/10",
    },
    {
      title: "Gastos del mes",
      value: summary ? formatCurrencyCOP(summary.monthlyExpense) : "$0",
      description: "Acumulado del mes",
      icon: ArrowDownRight,
      accentClass: "border-t-chart-4",
      color: "text-chart-4",
      bg: "bg-chart-4/10",
    },
    {
      title: "Suscripciones",
      value: subscriptionDash ? formatCurrencyCOP(subscriptionDash.monthlyTotal) : "$0",
      description: subscriptionDash ? `${subscriptionDash.activeCount} activas` : "Cargando...",
      icon: Repeat,
      accentClass: "border-t-chart-3",
      color: "text-chart-3",
      bg: "bg-chart-3/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-normal tracking-tight">
          Bienvenido, {user?.name ?? "Usuario"}
        </h2>
        <p className="text-muted-foreground">
          Este es el resumen de tus finanzas.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ title, value, description, icon: Icon, accentClass, color, bg, valueClass }) => (
          <Card
            key={title}
            className={cn(
              "group border-t-2 border-t-transparent transition-colors hover:border-primary/20",
              accentClass
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {title}
              </CardTitle>
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", bg)}>
                <Icon className={cn("h-5 w-5", color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "text-2xl font-normal tabular-nums",
                  valueClass,
                  summaryLoading && "animate-pulse"
                )}
              >
                {value}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Movimientos recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="space-y-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="flex items-center rounded-lg p-2">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
                      <div className="min-w-0 flex-1">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="mt-1 h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-16 shrink-0" />
                  </div>
                ))}
              </div>
            ) : !summary || summary.recentTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <DollarSign className="mb-3 h-10 w-10 opacity-30" />
                <p className="text-sm">No hay movimientos registrados</p>
                <p className="mt-1 text-xs">
                  Empieza agregando tu primer ingreso o gasto.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {summary.recentTransactions.map((tx: Transaction) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-accent/30"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          tx.category?.type === "INCOME"
                            ? "bg-chart-2/10 text-chart-2"
                            : "bg-chart-4/10 text-chart-4"
                        )}
                      >
                        {tx.category ? (
                          <LazyIcon name={tx.category.icon} className="h-4 w-4" />
                        ) : (
                          <DollarSign className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {tx.description || tx.category?.name || "Sin descripcion"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tx.category?.name} &middot;{" "}
                          {formatDateCol(tx.date, "dd MMM")}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 text-sm font-medium tabular-nums",
                        tx.category?.type === "INCOME"
                          ? "text-chart-2"
                          : "text-chart-4"
                      )}
                    >
                      {tx.category?.type === "INCOME" ? "+" : "-"}
                      {formatCurrencyCOP(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Distribucion de gastos</CardTitle>
          </CardHeader>
          <CardContent>
            {!expensesByCategory || expensesByCategory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mb-3 opacity-30"
                >
                  <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                  <path d="M22 12A10 10 0 0 0 12 2v10z" />
                </svg>
                <p className="text-sm">Sin datos para mostrar</p>
                <p className="mt-1 text-xs">
                  El grafico aparecera cuando registres gastos.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <div className="h-48 w-48 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expensesByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={2}
                        dataKey="total"
                        nameKey="categoryName"
                      >
                        {expensesByCategory.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                            stroke="none"
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2 w-full">
                  {expensesByCategory.map((item, index) => (
                    <div key={item.categoryId} className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-sm"
                        style={{
                          backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                        }}
                      />
                      <div className="flex min-w-0 flex-1 items-center gap-1.5">
                        <LazyIcon name={item.categoryIcon} className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate text-sm">{item.categoryName}</span>
                      </div>
                      <span className="shrink-0 text-sm font-medium tabular-nums">
                        {formatCurrencyCOP(item.total)}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground tabular-nums w-10 text-right">
                        {item.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
