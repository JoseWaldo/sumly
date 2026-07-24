import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";

import { useRouter } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { AppLogo } from "@/components/shared/app-logo";
import { loginSchema, type LoginInput } from "@/features/auth/schemas/auth.schema";
import { useAuth } from "@/hooks/use-auth";

export function LoginForm() {
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginInput) {
    try {
      await login(data);
      router.navigate({ to: "/dashboard" });
    } catch {
      form.setError("root", {
        message: "Credenciales invalidas. Intenta de nuevo.",
      });
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <AppLogo showText={false} className="mb-2 justify-center" />
        <CardTitle className="text-xl">Iniciar sesion</CardTitle>
        <CardDescription>
          Ingresa tus credenciales para acceder a tu cuenta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electronico</FormLabel>
                  <FormControl>
                    <Input placeholder="correo@ejemplo.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contrasena</FormLabel>
                  <FormControl>
                    <Input placeholder="******" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.formState.errors.root && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || isLoading}>
              {form.formState.isSubmitting || isLoading ? "Cargando..." : "Iniciar sesion"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          No tienes cuenta?{" "}
          <Link to="/auth/register" className="font-medium text-primary underline hover:opacity-80">
            Registrate
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
