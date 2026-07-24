import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DateInput } from "@/components/ui/date-input";
import { CurrencyInput } from "@/components/ui/currency-input";
import {
  subscriptionFormSchema,
  type SubscriptionFormInput,
  type Subscription,
} from "@/features/subscriptions/schemas/subscription.schema";
import { useTags, useCreateTag } from "@/features/subscriptions/hooks/use-subscriptions";
import { useFormasPago } from "@/features/formas-pago/hooks/use-formas-pago";
import { cn } from "@/lib/utils";

const FREQUENCIES = [
  { value: "MONTHLY", label: "Mensual" },
  { value: "YEARLY", label: "Anual" },
  { value: "QUARTERLY", label: "Trimestral" },
  { value: "BIWEEKLY", label: "Quincenal" },
  { value: "WEEKLY", label: "Semanal" },
];

const STATUSES = [
  { value: "ACTIVE", label: "Activa" },
  { value: "PAUSED", label: "Pausada" },
  { value: "CANCELLED", label: "Cancelada" },
];

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#6366f1", "#a855f7", "#ec4899", "#6b7280",
];

interface SubscriptionDialogProps {
  open: boolean;
  onClose: () => void;
  defaultValues?: Subscription | null;
  onSubmit: (data: SubscriptionFormInput) => Promise<void>;
  isLoading?: boolean;
}

export function SubscriptionDialog({ open, onClose, defaultValues, onSubmit, isLoading }: SubscriptionDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const { data: tags } = useTags();
  const { data: formasPago } = useFormasPago({ page: 1, limit: 100 });
  const createTag = useCreateTag();
  const [showNewTag, setShowNewTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3b82f6");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const form = useForm<SubscriptionFormInput>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: getDefaultFormValues(),
  });

  useEffect(() => {
    if (open) {
      form.reset(getDefaultFormValues());
    }
  }, [open, defaultValues]);

  function getDefaultFormValues(): SubscriptionFormInput {
    if (defaultValues) {
      return {
        name: defaultValues.name,
        amount: defaultValues.amount,
        nextPaymentDate: defaultValues.nextPaymentDate.split("T")[0],
        frequency: defaultValues.frequency,
        status: defaultValues.status,
        formaPagoId: defaultValues.formaPago?.id ?? "",
        tagIds: defaultValues.tags.map((t) => t.id),
      };
    }
    return {
      name: "",
      amount: 0,
      nextPaymentDate: new Date().toISOString().split("T")[0],
      frequency: "MONTHLY",
      status: "ACTIVE",
      formaPagoId: "",
      tagIds: [],
    };
  }

  const handleSubmit = async (data: SubscriptionFormInput) => {
    await onSubmit(data);
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    try {
      const created = await createTag.mutateAsync({ name: newTagName.trim(), color: newTagColor });
      const current = form.getValues("tagIds") ?? [];
      form.setValue("tagIds", [...current, created.id]);
      setNewTagName("");
      setShowNewTag(false);
    } catch {
      // error handled by react-query
    }
  };

  if (!open) return null;

  const formattedFormasPago = formasPago?.data ?? [];

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="w-[98%] max-w-md max-h-[90vh] overflow-y-auto rounded-xl border border-border/30 bg-card p-6 shadow-lg sm:w-full">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-medium">
            {defaultValues ? "Editar suscripcion" : "Nueva suscripcion"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Netflix, Spotify..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value as number}
                      onChange={(val) => field.onChange(val)}
                      placeholder="0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frecuencia</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onChange={field.onChange}
                      >
                        {FREQUENCIES.map((f) => (
                          <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onChange={field.onChange}
                      >
                        {STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="nextPaymentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proximo pago</FormLabel>
                  <FormControl>
                    <DateInput value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="formaPagoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de pago</FormLabel>
                  <FormControl>
                    <Select value={field.value} onChange={field.onChange}>
                      <option value="">Selecciona una forma de pago...</option>
                      {formattedFormasPago.map((fp) => (
                        <option key={fp.id} value={fp.id}>
                          {fp.nombre}{fp.ultimosCuatro ? ` (•••• ${fp.ultimosCuatro})` : ""}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormMessage />
                  {formasPago && formattedFormasPago.length === 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      No tienes formas de pago.{" "}
                      <Link to="/dashboard/formas-de-pago" className="text-primary underline">
                        Crea una aqui
                      </Link>
                    </p>
                  )}
                </FormItem>
              )}
            />

            <div>
              <FormLabel className="mb-3 block">Tags</FormLabel>
              <input type="hidden" {...form.register("tagIds")} />
              <div className="flex flex-wrap gap-2 mb-3">
                {tags?.map((tag) => {
                  const selected = form.watch("tagIds")?.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => {
                        const current = form.getValues("tagIds") ?? [];
                        const next = selected
                          ? current.filter((id) => id !== tag.id)
                          : [...current, tag.id];
                        form.setValue("tagIds", next);
                      }}
                      className={cn(
                        "inline-flex cursor-pointer items-center rounded-full px-2.5 py-0.5 text-xs font-medium border transition-all",
                        selected
                          ? "border-current opacity-100"
                          : "border-transparent opacity-60 hover:opacity-100"
                      )}
                      style={{
                        backgroundColor: `${tag.color}20`,
                        color: tag.color,
                        borderColor: selected ? tag.color : "transparent",
                      }}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>

              {showNewTag ? (
                <div className="flex items-end gap-3 mt-2">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Nombre del tag"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      className="h-9 text-sm"
                    />
                    <div className="flex gap-1.5">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setNewTagColor(c)}
                          className={cn(
                            "h-6 w-6 rounded-full border-2 cursor-pointer",
                            c === newTagColor ? "border-foreground" : "border-transparent"
                          )}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="h-9 shrink-0 cursor-pointer"
                    onClick={handleCreateTag}
                    disabled={!newTagName.trim() || createTag.isPending}
                  >
                    {createTag.isPending ? "..." : "Crear"}
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowNewTag(true)}
                  className="inline-flex cursor-pointer items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  Nuevo tag
                </button>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting || isLoading}>
                {form.formState.isSubmitting || isLoading ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
