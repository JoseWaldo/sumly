import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { profileSchema, type ProfileInput } from "@/features/user/schemas/profile.schema";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ProfileForm() {
  const { user, updateProfile } = useAuth();

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
    },
  });

  async function onSubmit(data: ProfileInput) {
    await updateProfile(data.name);
    form.reset({ name: data.name });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Foto de perfil</CardTitle>
          <CardDescription>
            Sube una foto para personalizar tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name ?? ""}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span className="text-2xl font-medium text-muted-foreground">
                {user?.name ? getInitials(user.name) : <UserRound className="h-8 w-8" />}
              </span>
            )}
          </div>
          <div className="flex flex-col items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              <Camera className="h-4 w-4" />
              Subir foto
            </Button>
            <p className="text-xs text-muted-foreground">
              Proximamente
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datos personales</CardTitle>
          <CardDescription>
            Actualiza tu nombre. El resto de datos se gestionan desde tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Tu nombre" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={
                  form.formState.isSubmitting || !form.formState.isDirty
                }
              >
                Guardar cambios
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Apariencia</CardTitle>
          <CardDescription>
            Cambia entre tema claro y oscuro.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <span className="text-sm">Tema</span>
          <ThemeToggle />
        </CardContent>
      </Card>
    </div>
  );
}
