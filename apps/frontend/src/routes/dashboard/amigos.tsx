import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Users, UserPlus, UserCheck, Ban, UserRound, Clock, Check, X, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { env } from "@/config/env";
import { formatDateCol } from "@/lib/date-utils";

function getUserImageUrl(image: string | null | undefined): string | null {
  if (!image) return null;
  return `${env.apiUrl}/api/v1/files/${image}/view`;
}
import {
  useFriends,
  useSearchUser,
  useReceivedRequests,
  useSentRequests,
  useBlockedUsers,
  useSendRequest,
  useAcceptRequest,
  useRejectRequest,
  useCancelRequest,
  useRemoveFriend,
  useUnblockUser,
} from "@/features/friendships/hooks/use-friendships";
import type { SearchUserResult } from "@/features/friendships/schemas/friendship.schema";

export const Route = createFileRoute("/dashboard/amigos")({
  component: AmigosPage,
});

type Tab = "friends" | "search" | "requests" | "blocked";

const tabs: { key: Tab; label: string; icon: typeof Users }[] = [
  { key: "friends", label: "Mis Amigos", icon: Users },
  { key: "search", label: "Buscar", icon: UserPlus },
  { key: "requests", label: "Solicitudes", icon: Clock },
  { key: "blocked", label: "Bloqueados", icon: Ban },
];

const PAGE_SIZE = 20;

function AmigosPage() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<Tab>("friends");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [debouncedEmail, setDebouncedEmail] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [requestsTab, setRequestsTab] = useState<"received" | "sent">("received");

  const { data: friendsData, isLoading: friendsLoading } = useFriends({
    search: search || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const { data: searchResult, isLoading: searchLoading, isFetched: searchFetched } = useSearchUser(debouncedEmail);

  const { data: receivedData, isLoading: receivedLoading } = useReceivedRequests();
  const { data: sentData, isLoading: sentLoading } = useSentRequests();
  const { data: blockedData, isLoading: blockedLoading } = useBlockedUsers();

  const sendRequest = useSendRequest();
  const acceptRequest = useAcceptRequest();
  const rejectRequest = useRejectRequest();
  const cancelRequest = useCancelRequest();
  const removeFriend = useRemoveFriend();
  const unblockUser = useUnblockUser();

  const friends = friendsData?.data ?? [];
  const totalPages = friendsData?.totalPages ?? 1;

  const received = receivedData?.data ?? [];
  const sent = sentData?.data ?? [];
  const blocked = blockedData?.data ?? [];

  const pendingCount = received.length;

  const handleSearch = () => {
    setDebouncedEmail(searchEmail.trim());
  };

  const handleSendRequest = async (addresseeId: string) => {
    try {
      await sendRequest.mutateAsync({ addresseeId });
      toast("Solicitud enviada");
    } catch (e: any) {
      toast(e?.message ?? "Error al enviar solicitud", "error");
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await acceptRequest.mutateAsync(id);
      toast("Solicitud aceptada");
    } catch (e: any) {
      toast(e?.message ?? "Error al aceptar", "error");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectRequest.mutateAsync(id);
      toast("Solicitud rechazada");
    } catch (e: any) {
      toast(e?.message ?? "Error al rechazar", "error");
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelRequest.mutateAsync(id);
      toast("Solicitud cancelada");
    } catch (e: any) {
      toast(e?.message ?? "Error al cancelar", "error");
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeFriend.mutateAsync(id);
      toast("Amigo eliminado");
      setConfirmId(null);
    } catch (e: any) {
      toast(e?.message ?? "Error al eliminar", "error");
    }
  };

  const handleUnblock = async (id: string) => {
    try {
      await unblockUser.mutateAsync(id);
      toast("Usuario desbloqueado");
    } catch (e: any) {
      toast(e?.message ?? "Error al desbloquear", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Amigos</h1>
        <p className="text-sm text-muted-foreground">Conectá con otros usuarios para compartir deudas y dividir cuentas.</p>
      </div>

      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); setPage(1); }}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer",
              activeTab === key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
            {key === "requests" && pendingCount > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "friends" && (
        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0 pb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar amigo..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            {friendsLoading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Cargando...</p>
            ) : friends.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <Users className="h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No tenés amigos aún.</p>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("search")}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Buscar usuarios
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {friends.map((f) => (
                  <div key={f.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                        {getUserImageUrl(f.otherUser?.image) ? (
                          <img src={getUserImageUrl(f.otherUser?.image)!} alt="" className="h-full w-full rounded-full object-cover" />
                        ) : (
                          f.otherUser?.name?.charAt(0).toUpperCase() ?? "?"
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{f.otherUser?.name ?? "Usuario"}</p>
                        <p className="text-xs text-muted-foreground">
                          Amigos desde {formatDateCol(f.createdAt)}
                        </p>
                      </div>
                    </div>
                    {confirmId === f.id ? (
                      <div className="flex items-center gap-1">
                        <Button variant="destructive" size="sm" onClick={() => handleRemove(f.id)}>
                          Confirmar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setConfirmId(null)}>
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="icon" onClick={() => setConfirmId(f.id)} className="text-muted-foreground hover:text-destructive cursor-pointer">
                        <UserX className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">Página {page} de {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Siguiente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "search" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Buscar usuario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Ingresá el correo exacto..."
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
              />
              <Button onClick={handleSearch} disabled={searchLoading}>
                Buscar
              </Button>
            </div>

            {searchLoading && (
              <p className="text-center text-sm text-muted-foreground">Buscando...</p>
            )}

            {searchFetched && !searchResult && (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <UserRound className="h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No se encontró ningún usuario con ese correo.</p>
              </div>
            )}

            {searchResult && (
              <SearchResultCard
                result={searchResult}
                currentUserId={currentUser?.id ?? ""}
                onSendRequest={handleSendRequest}
                sending={sendRequest.isPending}
              />
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "requests" && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
              <button
                onClick={() => setRequestsTab("received")}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition-colors cursor-pointer",
                  requestsTab === "received"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Recibidas {received.length > 0 && `(${received.length})`}
              </button>
              <button
                onClick={() => setRequestsTab("sent")}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition-colors cursor-pointer",
                  requestsTab === "sent"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Enviadas {sent.length > 0 && `(${sent.length})`}
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {requestsTab === "received" && (
              receivedLoading ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Cargando...</p>
              ) : received.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                  <Clock className="h-10 w-10 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No tenés solicitudes pendientes.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {received.map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                          {r.otherUser?.name?.charAt(0).toUpperCase() ?? "?"}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{r.otherUser?.name ?? "Usuario"}</p>
                          <p className="text-xs text-muted-foreground">{formatDateCol(r.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="sm" onClick={() => handleAccept(r.id)}>
                          <Check className="mr-1 h-4 w-4" />
                          Aceptar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleReject(r.id)} className="text-muted-foreground hover:text-destructive cursor-pointer">
                          <X className="mr-1 h-4 w-4" />
                          Rechazar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {requestsTab === "sent" && (
              sentLoading ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Cargando...</p>
              ) : sent.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                  <Clock className="h-10 w-10 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No tenés solicitudes enviadas pendientes.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sent.map((s) => (
                    <div key={s.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                          {s.otherUser?.name?.charAt(0).toUpperCase() ?? "?"}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{s.otherUser?.name ?? "Usuario"}</p>
                          <p className="text-xs text-muted-foreground">{formatDateCol(s.createdAt)}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleCancel(s.id)} className="text-muted-foreground hover:text-destructive cursor-pointer">
                        <X className="mr-1 h-4 w-4" />
                        Cancelar
                      </Button>
                    </div>
                  ))}
                </div>
              )
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "blocked" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Usuarios bloqueados</CardTitle>
          </CardHeader>
          <CardContent>
            {blockedLoading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Cargando...</p>
            ) : blocked.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <Ban className="h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No tenés usuarios bloqueados.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {blocked.map((b) => (
                  <div key={b.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                        {b.otherUser?.name?.charAt(0).toUpperCase() ?? "?"}
                      </div>
                      <p className="text-sm font-medium">{b.otherUser?.name ?? "Usuario"}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleUnblock(b.id)}>
                      Desbloquear
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SearchResultCard({
  result,
  currentUserId,
  onSendRequest,
  sending,
}: {
  result: SearchUserResult;
  currentUserId: string;
  onSendRequest: (id: string) => void;
  sending: boolean;
}) {
  if (result.id === currentUserId) {
    return (
      <div className="flex items-center gap-3 rounded-lg border p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-medium text-primary">
          {result.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-medium">{result.name}</p>
          <p className="text-sm text-muted-foreground">Esta es tu propia cuenta</p>
        </div>
      </div>
    );
  }

  const status = result.existingFriendship?.status;

  let action: React.ReactNode;
  if (status === "ACCEPTED") {
    action = (
      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        <UserCheck className="h-3 w-3" />
        Ya son amigos
      </span>
    );
  } else if (status === "PENDING") {
    const dir = result.existingFriendship?.direction;
    action = (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600">
        <Clock className="h-3 w-3" />
        {dir === "sent" ? "Solicitud enviada" : "Te envió solicitud"}
      </span>
    );
  } else if (status === "BLOCKED") {
    action = (
      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
        <Ban className="h-3 w-3" />
        No disponible
      </span>
    );
  } else {
    action = (
      <Button size="sm" onClick={() => onSendRequest(result.id)} disabled={sending}>
        <UserPlus className="mr-1 h-4 w-4" />
        {sending ? "Enviando..." : "Enviar solicitud"}
      </Button>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-medium text-primary">
          {getUserImageUrl(result.image) ? (
            <img src={getUserImageUrl(result.image)!} alt="" className="h-full w-full rounded-full object-cover" />
          ) : (
            result.name.charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <p className="font-medium">{result.name}</p>
          <p className="text-sm text-muted-foreground">{result.email}</p>
        </div>
      </div>
      {action}
    </div>
  );
}
