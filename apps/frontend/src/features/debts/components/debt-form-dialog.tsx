import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { createDeudaSchema, type CreateDeudaInput } from "@/features/debts/schemas/debt.schema";
import { useFriends } from "@/features/friendships/hooks/use-friendships";
import { X } from "lucide-react";

interface FriendOption {
  id: string;
  name: string;
  email: string;
}

interface DebtFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDeudaInput) => Promise<void>;
  isLoading: boolean;
}

export function DebtFormDialog({ open, onClose, onSubmit, isLoading }: DebtFormDialogProps) {
  const [modoDestinatario, setModoDestinatario] = useState<"amigos" | "texto">("amigos");
  const [selectedFriends, setSelectedFriends] = useState<FriendOption[]>([]);
  const [nombreLibre, setNombreLibre] = useState("");
  const [searchFriends, setSearchFriends] = useState("");

  const { data: friendsData } = useFriends({
    search: searchFriends || undefined,
    page: 1,
    limit: 20,
  });

  const friends: FriendOption[] = (friendsData?.data ?? []).map((f: any) => ({
    id: f.otherUser?.id ?? "",
    name: f.otherUser?.name ?? "",
    email: f.otherUser?.email ?? "",
  }));

  const form = useForm<CreateDeudaInput>({
    resolver: zodResolver(createDeudaSchema),
    defaultValues: {
      direccion: "ME_DEBEN",
      descripcion: "",
      montoBase: "" as unknown as number,
      fechaVencimiento: "",
      autoConfirmar: true,
      destinatarios: [],
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        direccion: "ME_DEBEN",
        descripcion: "",
        montoBase: "" as unknown as number,
        fechaVencimiento: "",
        autoConfirmar: true,
        destinatarios: [],
      });
      setSelectedFriends([]);
      setNombreLibre("");
      setModoDestinatario("amigos");
    }
  }, [open]);

  const montoBase = useWatch({ control: form.control, name: "montoBase" });

  const toggleFriend = (friend: FriendOption) => {
    if (selectedFriends.find((f) => f.id === friend.id)) {
      setSelectedFriends((prev) => prev.filter((f) => f.id !== friend.id));
    } else {
      if (selectedFriends.length >= 10) return;
      setSelectedFriends((prev) => [...prev, friend]);
    }
  };

  const handleSubmit = async (data: CreateDeudaInput) => {
    if (modoDestinatario === "amigos") {
      if (selectedFriends.length === 0) {
        form.setError("destinatarios", { message: "Selecciona al menos un amigo" });
        return;
      }
      data.destinatarios = selectedFriends.map((f) => ({
        amigoId: f.id,
        monto: montoBase || 0,
      }));
    } else {
      if (!nombreLibre.trim()) {
        form.setError("destinatarios", { message: "Ingresa un nombre" });
        return;
      }
      data.destinatarios = [{ nombreLibre: nombreLibre.trim(), monto: montoBase || 0 }];
    }

    try {
      await onSubmit(data);
      onClose();
    } catch (e: any) {
      form.setError("root", { message: e?.message ?? "Error al crear la deuda" });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md animate-scale-in rounded-xl border border-border bg-card p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-foreground">Nueva deuda</h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="mt-4 space-y-4">
            {/* Direccion */}
            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Direccion</FormLabel>
                  <FormControl>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => field.onChange("ME_DEBEN")}
                        className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                          field.value === "ME_DEBEN"
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "border-input/40 text-muted-foreground hover:border-input hover:text-foreground"
                        }`}
                      >
                        Me deben
                      </button>
                      <button
                        type="button"
                        onClick={() => field.onChange("YO_DEBO")}
                        className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                          field.value === "YO_DEBO"
                            ? "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            : "border-input/40 text-muted-foreground hover:border-input hover:text-foreground"
                        }`}
                      >
                        Yo debo
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descripcion */}
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripcion</FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      placeholder="Ej: Cena viernes"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Destinatario */}
            <FormItem>
              <FormLabel>Destinatario</FormLabel>
              <div className="flex gap-1 mb-2">
                <button
                  type="button"
                  onClick={() => setModoDestinatario("amigos")}
                  className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                    modoDestinatario === "amigos"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Amigo(s)
                </button>
                <button
                  type="button"
                  onClick={() => setModoDestinatario("texto")}
                  className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                    modoDestinatario === "texto"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Texto libre
                </button>
              </div>

              {modoDestinatario === "amigos" ? (
                <>
                  <input
                    type="text"
                    placeholder="Buscar amigos..."
                    value={searchFriends}
                    onChange={(e) => setSearchFriends(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mb-2"
                  />
                  <div className="max-h-36 overflow-y-auto scrollbar-thin space-y-1 border border-border rounded-lg p-1">
                    {friends.map((f) => {
                      const selected = selectedFriends.find((s) => s.id === f.id);
                      return (
                        <div
                          key={f.id}
                          onClick={() => toggleFriend(f)}
                          className={`flex items-center justify-between rounded-md px-3 py-2 cursor-pointer text-sm transition-colors ${
                            selected
                              ? "bg-primary/10 border border-primary/30"
                              : "hover:bg-accent"
                          }`}
                        >
                          <div>
                            <p className="font-medium">{f.name}</p>
                            <p className="text-xs text-muted-foreground">{f.email}</p>
                          </div>
                          {selected && <X className="h-3.5 w-3.5 text-primary" />}
                        </div>
                      );
                    })}
                    {friends.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-3">No se encontraron amigos</p>
                    )}
                  </div>
                  {selectedFriends.length > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {selectedFriends.length} amigo{selectedFriends.length > 1 ? "s" : ""} seleccionado{selectedFriends.length > 1 ? "s" : ""}
                    </p>
                  )}
                </>
              ) : (
                <input
                  type="text"
                  placeholder="Nombre de la persona"
                  value={nombreLibre}
                  onChange={(e) => setNombreLibre(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              )}
              <FormMessage />
            </FormItem>

            {/* Monto */}
            <FormField
              control={form.control}
              name="montoBase"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value ?? 0}
                      onChange={field.onChange}
                      placeholder="0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Vencimiento */}
            <FormField
              control={form.control}
              name="fechaVencimiento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vencimiento</FormLabel>
                  <FormControl>
                    <DateInput value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Auto-confirmar */}
            <FormField
              control={form.control}
              name="autoConfirmar"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Auto-confirmar pagos</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting || isLoading}>
                {form.formState.isSubmitting || isLoading ? "Creando..." : "Crear deuda"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
