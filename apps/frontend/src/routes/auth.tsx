import { Outlet, createFileRoute, Link } from "@tanstack/react-router";

import { AppLogo } from "@/components/shared/app-logo";

export const Route = createFileRoute("/auth")({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center px-4">
        <Link to="/">
          <AppLogo />
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <Outlet />
      </main>
    </div>
  );
}
