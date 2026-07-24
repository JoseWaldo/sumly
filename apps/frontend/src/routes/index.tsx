import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Repeat, Wallet } from "lucide-react";

import { AppLogo } from "@/components/shared/app-logo";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: Index,
  beforeLoad: async () => {
    const { data } = await authClient.getSession();
    if (data?.user) {
      throw redirect({ to: "/dashboard" });
    }
  },
});

const features = [
  {
    icon: Wallet,
    title: "Ingresos y gastos",
    description: "Registra cada movimiento y manten el control total de tu dinero.",
    large: true,
  },
  {
    icon: Repeat,
    title: "Control de suscripciones",
    description: "Gestiona tus suscripciones recurrentes, recibe recordatorios y registra sus pagos.",
  },
  {
    icon: BarChart3,
    title: "Reportes claros",
    description: "Visualiza tus finanzas con graficos simples y entiende a donde va tu plata.",
  },
];

function Index() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-border/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4">
          <AppLogo />
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="flex flex-1 flex-col items-center justify-center px-4 py-28 lg:py-32 text-center">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              viewBox="0 0 32 32"
              fill="none"
              className="text-primary"
            >
              <path
                d="M10 16.5L14.5 21L22 11"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 className="max-w-2xl text-4xl leading-tight font-normal tracking-tight sm:text-5xl lg:text-[56px] lg:leading-[1.05]">
            Tus finanzas en
            <span className="text-primary dark:glow-text"> equilibrio</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-muted-foreground">
            Sumly te ayuda a gestionar tus ingresos, gastos y presupuestos de
            forma sencilla. Toma el control de tu dinero.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link to="/auth/register">
              <Button size="lg" className="h-11 px-8 text-base ring-1 ring-primary/30">
                Comenzar gratis
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth/login">
              <Button variant="outline" size="lg" className="h-11 px-8 text-base">
                Iniciar sesion
              </Button>
            </Link>
          </div>
        </section>

        <section className="border-t border-border/30 bg-muted/40 px-4 py-28 lg:py-32">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-3xl font-normal tracking-tight lg:text-4xl lg:leading-[1.2]">
              Todo lo que necesitas para organizar tus finanzas
            </h2>
            <p className="mt-3 text-center text-muted-foreground">
              Herramientas simples, resultados claros.
            </p>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map(({ icon: Icon, title, description, large }) => (
                <div
                  key={title}
                  className={cn(
                    "group flex flex-col rounded-xl border border-border/30 bg-card p-6 transition-colors",
                    "hover:border-primary/20",
                    large && "sm:col-span-2"
                  )}
                >
                  {large && (
                    <div className="-mx-6 -mt-6 mb-5 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                  )}
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-base font-medium">{title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/30 px-4 py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <AppLogo />
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Sumly
          </p>
        </div>
      </footer>
    </div>
  );
}
