import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Trash2, UserRound } from "lucide-react";

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
import { FileUpload } from "@/components/ui/file-upload";
import { env } from "@/config/env";
import { profileSchema, type ProfileInput } from "@/features/user/schemas/profile.schema";
import type { FileRecordUploadResponse } from "@/features/files/schemas/file.schema";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getImageUrl(image?: string | null): string | null {
  if (!image) return null;
  return `${env.apiUrl}/api/v1/files/${image}/view`;
}

export function ProfileForm() {
  const { user, updateProfile } = useAuth();
  const [showUpload, setShowUpload] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      image: user?.image ?? undefined,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name ?? "",
        image: user.image ?? undefined,
      });
    }
  }, [user, form]);

  async function onSubmit(data: ProfileInput) {
    await updateProfile(data.name, data.image);
    form.reset({ name: data.name, image: data.image });
  }

  async function handleUploaded(result: FileRecordUploadResponse) {
    setShowUpload(false);
    setUploadError(null);
    form.setValue("image", result.id);

    const currentName = form.getValues("name");
    await updateProfile(currentName, result.id);
    form.reset({ name: currentName, image: result.id });
  }

  async function handleRemovePhoto() {
    setShowUpload(false);
    setUploadError(null);
    form.setValue("image", undefined);
    await updateProfile(form.getValues("name"), null);
    form.reset({ name: form.getValues("name"), image: undefined });
  }

  const imageUrl = getImageUrl(form.watch("image") ?? user?.image);
  const nameValue = form.watch("name") || user?.name;

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
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={nameValue ?? ""}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span className="text-2xl font-medium text-muted-foreground">
                {nameValue ? getInitials(nameValue) : <UserRound className="h-8 w-8" />}
              </span>
            )}
          </div>
          {uploadError && (
            <p className="text-sm text-destructive">{uploadError}</p>
          )}
          {showUpload ? (
            <div className="w-full max-w-sm">
              <FileUpload
                onUploaded={handleUploaded}
                onError={(err) => setUploadError(err)}
                acceptTypes={["image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml"]}
                maxSize={5 * 1024 * 1024}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowUpload(true);
                    setUploadError(null);
                  }}
                >
                  <Camera className="h-4 w-4" />
                  {form.watch("image") || user?.image ? "Cambiar foto" : "Subir foto"}
                </Button>
                {(form.watch("image") || user?.image) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemovePhoto}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </Button>
                )}
              </div>
            </div>
          )}
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
