import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { useEffect } from "react";
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
import { useEntidadesFinancieras } from "@/features/formas-pago/hooks/use-entidades-financieras";
import {
  formaPagoFormSchema,
  type FormaPagoFormInput,
  type FormaPago,
  formatWithPattern,
  unformat,
} from "@/features/formas-pago/schemas/forma-pago.schema";

interface FormaPagoFormProps {
  defaultValues?: FormaPago | null;
  onSubmit: (data: FormaPagoFormInput) => Promise<void>;
  isLoading?: boolean;
}

export function FormaPagoForm({ defaultValues, onSubmit, isLoading }: FormaPagoFormProps) {
  const form = useForm<FormaPagoFormInput>({
    resolver: zodResolver(formaPagoFormSchema),
    defaultValues: {
      nombre: defaultValues?.nombre ?? "",
      tipo: (defaultValues?.tipo as "CREDIT" | "DEBIT") ?? "CREDIT",
      numero: "",
      publico: defaultValues?.publico ?? false,
      gradienteInicio: defaultValues?.gradienteInicio ?? "#7B2FBE",
      gradienteFin: defaultValues?.gradienteFin ?? "#4A1D8A",
      entidadFinancieraId: defaultValues?.entidadFinancieraId ?? null,
    },
  });

  const { data: entidadesData } = useEntidadesFinancieras();
  const entidades = entidadesData?.data ?? [];

  const entidadId = useWatch({ control: form.control, name: "entidadFinancieraId" });
  const gradienteInicio = useWatch({ control: form.control, name: "gradienteInicio" });
  const gradienteFin = useWatch({ control: form.control, name: "gradienteFin" });

  useEffect(() => {
    if (entidadId) {
      const entidad = entidades.find((e) => e.id === entidadId);
      if (entidad) {
        form.setValue("gradienteInicio", entidad.gradienteInicio);
        form.setValue("gradienteFin", entidad.gradienteFin);
      }
    }
  }, [entidadId, entidades, form]);

  const handleSubmit = async (data: FormaPagoFormInput) => {
    await onSubmit({ ...data, numero: unformat(data.numero) });
  };

  const getFormat = useCallback((): string | null => {
    if (entidadId) {
      const entidad = entidades.find((e) => e.id === entidadId);
      return entidad?.formatoNumero ?? null;
    }
    return null;
  }, [entidadId, entidades]);

  const handleNumeroChange = useCallback(
    (value: string) => {
      const pattern = getFormat();
      if (pattern) {
        form.setValue("numero", formatWithPattern(value, pattern), { shouldValidate: false });
      } else {
        form.setValue("numero", value, { shouldValidate: false });
      }
    },
    [getFormat, form],
  );

  const numeroPlaceholder = getFormat() ?? "Ingresa el numero";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="entidadFinancieraId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Entidad financiera</FormLabel>
              <FormControl>
                <Select
                  value={field.value ?? ""}
                  onChange={(val) => field.onChange(val || null)}
                >
                  <option value="">Ninguna (sin entidad)</option>
                  {entidades.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nombre} {e.esSistema ? "(sistema)" : ""}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Mi TC Bancolombia" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tipo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <FormControl>
                <Select value={field.value} onChange={field.onChange}>
                  <option value="CREDIT">Credito</option>
                  <option value="DEBIT">Debito</option>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="numero"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Numero</FormLabel>
              <FormControl>
                <Input
                  placeholder={numeroPlaceholder}
                  value={field.value}
                  onChange={(e) => handleNumeroChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-1">
          <FormLabel>Colores</FormLabel>
          <div className="flex gap-3">
            <div className="flex-1">
              <FormField
                control={form.control}
                name="gradienteInicio"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          className="h-9 w-12 cursor-pointer p-1"
                          {...field}
                        />
                        <Input
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="#FFD100"
                          className="font-mono text-xs"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex-1">
              <FormField
                control={form.control}
                name="gradienteFin"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          className="h-9 w-12 cursor-pointer p-1"
                          {...field}
                        />
                        <Input
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="#FCA311"
                          className="font-mono text-xs"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div
            className="mt-1 h-6 rounded-md"
            style={{
              background: `linear-gradient(135deg, ${gradienteInicio}, ${gradienteFin})`,
            }}
          />
        </div>

        <FormField
          control={form.control}
          name="publico"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border border-border/30 p-3">
              <div>
                <FormLabel className="text-sm">Publica</FormLabel>
                <p className="text-xs text-muted-foreground">
                  {field.value
                    ? "El numero se muestra sin ofuscar"
                    : "El numero se oculta por seguridad"}
                </p>
              </div>
              <FormControl>
                <button
                  type="button"
                  role="switch"
                  aria-checked={field.value}
                  onClick={() => field.onChange(!field.value)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors ${
                    field.value ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      field.value ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" disabled={form.formState.isSubmitting || isLoading}>
            {form.formState.isSubmitting || isLoading ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
