import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import type { EntidadFinanciera } from "@/features/formas-pago/schemas/forma-pago.schema";

const entidadFormSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50),
  gradienteInicio: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color invalido"),
  gradienteFin: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color invalido"),
  formatoNumero: z.string().max(30).nullable(),
});

type EntidadFormInput = z.infer<typeof entidadFormSchema>;

interface EntidadFinancieraFormProps {
  defaultValues?: EntidadFinanciera | null;
  onSubmit: (data: EntidadFormInput) => Promise<void>;
  isLoading?: boolean;
}

export function EntidadFinancieraForm({ defaultValues, onSubmit, isLoading }: EntidadFinancieraFormProps) {
  const form = useForm<EntidadFormInput>({
    resolver: zodResolver(entidadFormSchema),
    defaultValues: {
      nombre: defaultValues?.nombre ?? "",
      gradienteInicio: defaultValues?.gradienteInicio ?? "#6366F1",
      gradienteFin: defaultValues?.gradienteFin ?? "#4F46E5",
      formatoNumero: defaultValues?.formatoNumero ?? null,
    },
  });

  const gradienteInicio = useWatch({ control: form.control, name: "gradienteInicio" });
  const gradienteFin = useWatch({ control: form.control, name: "gradienteFin" });

  const handleSubmit = async (data: EntidadFormInput) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="BBVA" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="formatoNumero"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Formato de numero (opcional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="XXX-XXXX-XXX"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value || null)}
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
                          placeholder="#6366F1"
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
                          placeholder="#4F46E5"
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

        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" disabled={form.formState.isSubmitting || isLoading}>
            {form.formState.isSubmitting || isLoading ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
