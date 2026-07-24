import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Menu } from "lucide-react";

import { Sidebar } from "@/components/layout/sidebar";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
  beforeLoad: async () => {
    const { data } = await authClient.getSession();
    if (!data) {
      throw redirect({ to: "/auth/login" });
    }
  },
});

function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={() => setCollapsed((c) => !c)}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main
        className={`flex-1 min-w-0 p-4 md:p-6 transition-all duration-300 overflow-x-hidden ${
          collapsed ? "md:ml-16" : "md:ml-60"
        }`}
      >
        <div className="mb-6 flex items-center gap-3 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <Outlet />
      </main>
    </div>
  );
}
