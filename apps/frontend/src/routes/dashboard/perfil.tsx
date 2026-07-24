import { createFileRoute } from "@tanstack/react-router";
import { UserRound } from "lucide-react";

import { ProfileForm } from "@/features/user/components/profile-form";

export const Route = createFileRoute("/dashboard/perfil")({
  component: PerfilPage,
});

function PerfilPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <UserRound className="h-8 w-8 text-muted-foreground" />
        <div>
          <h2 className="text-3xl font-normal tracking-tight">Perfil</h2>
          <p className="text-muted-foreground">
            Gestiona tu informacion personal y preferencias.
          </p>
        </div>
      </div>

      <ProfileForm />
    </div>
  );
}
