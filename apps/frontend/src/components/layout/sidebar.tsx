import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useRouter } from "@tanstack/react-router";
import { LayoutDashboard, History, Building2, CreditCard, Repeat, Tags, LogOut, ChevronLeft, ChevronRight, X, UserRound, Users, HandCoins, MoreVertical } from "lucide-react";

import { AppLogo } from "@/components/shared/app-logo";
import { Tooltip } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { env } from "@/config/env";
import { cn } from "@/lib/utils";

const navItems = [
  {
    to: "/dashboard",
    icon: LayoutDashboard,
    label: "Panel",
    exact: true,
  },
  {
    to: "/dashboard/historial",
    icon: History,
    label: "Historial",
    group: "Movimientos",
  },
  {
    to: "/dashboard/suscripciones",
    icon: Repeat,
    label: "Suscripciones",
    group: "Movimientos",
  },
  {
    to: "/dashboard/amigos",
    icon: Users,
    label: "Amigos",
  },
  {
    to: "/dashboard/deudas",
    icon: HandCoins,
    label: "Deudas",
  },
  {
    to: "/dashboard/entidades-financieras",
    icon: Building2,
    label: "Entidades financieras",
    group: "Configuración",
  },
  {
    to: "/dashboard/formas-de-pago",
    icon: CreditCard,
    label: "Formas de pago",
    group: "Configuración",
  },
  {
    to: "/dashboard/categorias",
    icon: Tags,
    label: "Categorías",
    group: "Configuración",
  },
  {
    to: "/dashboard/perfil",
    icon: UserRound,
    label: "Perfil",
  },
];

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggle: () => void;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, mobileOpen, onToggle, onMobileClose }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const router = useRouter();
  const expanded = mobileOpen || !collapsed;

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userMenuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  async function handleLogout() {
    setUserMenuOpen(false);
    await logout();
    router.navigate({ to: "/auth/login" });
  }

  const avatar = (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sidebar-accent text-sidebar-accent-foreground text-sm font-medium">
      {user?.image ? (
        <img
          src={`${env.apiUrl}/api/v1/files/${user.image}/view`}
          alt={user?.name ?? ""}
          className="h-full w-full object-cover"
        />
      ) : user?.name ? (
        user.name.charAt(0).toUpperCase()
      ) : (
        <UserRound className="h-4 w-4" />
      )}
    </div>
  );

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden animate-fade-in"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border/30 bg-sidebar transition-all duration-300",
          "-translate-x-full",
          mobileOpen && "translate-x-0",
          "md:translate-x-0",
          mobileOpen && "w-60",
          !mobileOpen && collapsed && "md:w-16",
          !mobileOpen && !collapsed && "md:w-60",
        )}
      >
        <div className="relative flex h-16 items-center justify-between px-3">
          <AppLogo
            showText={expanded}
            className={cn("overflow-hidden transition-opacity", !expanded && "justify-center")}
          />

          {mobileOpen && (
            <button
              onClick={onMobileClose}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <button
          onClick={onToggle}
          className={cn(
            "absolute right-0 top-1/2 z-10 hidden md:flex -translate-y-1/2 translate-x-1/2 h-6 w-6 items-center justify-center rounded border border-border/40 bg-background text-muted-foreground shadow-sm hover:text-foreground transition-all cursor-pointer",
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {navItems.map(({ to, icon: Icon, label, exact, group }, index) => {
            const isActive = exact
              ? location.pathname === to
              : location.pathname.startsWith(to);
            const prevGroup = index > 0 ? navItems[index - 1].group : undefined;
            const showGroupLabel = group && group !== prevGroup && expanded;
            const showDivider = !group && prevGroup && expanded;

            return (
              <div key={to}>
                {showDivider && (
                  <div className="mx-3 my-2 border-t border-border/20" />
                )}
                {showGroupLabel && (
                  <div className="px-3 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {group}
                  </div>
                )}
                <Tooltip content={label}>
                  <Link
                    to={to}
                    onClick={onMobileClose}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      !expanded && "justify-center px-2",
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {expanded && <span>{label}</span>}
                  </Link>
                </Tooltip>
              </div>
            );
          })}
        </nav>

        <div className="px-3 pb-4">
          <div className="relative" ref={userMenuRef}>
            {userMenuOpen && (
              <div
                className={cn(
                  "absolute bottom-full z-50 mb-2 rounded-lg border border-border/40 bg-popover p-1.5 shadow-lg animate-fade-in",
                  expanded ? "left-0 right-0" : "left-full ml-2 w-64",
                )}
              >
                <div className="flex items-center gap-3 rounded-md px-2 py-2">
                  {avatar}
                  <div className="overflow-hidden">
                    <p className="truncate text-sm font-medium text-popover-foreground">
                      {user?.name ?? "Usuario"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <div className="my-1 border-t border-border/30" />

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-popover-foreground transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </button>
              </div>
            )}

            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-sidebar-accent cursor-pointer",
                !expanded && "justify-center",
              )}
            >
              {avatar}
              {expanded && (
                <>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium text-sidebar-foreground">
                      {user?.name ?? "Usuario"}
                    </p>
                    <p className="truncate text-xs text-sidebar-foreground/60">
                      {user?.email}
                    </p>
                  </div>
                  <MoreVertical className="h-4 w-4 shrink-0 text-sidebar-foreground/60" />
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
