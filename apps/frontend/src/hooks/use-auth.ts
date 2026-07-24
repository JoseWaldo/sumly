import { useCallback } from "react";

import { authClient } from "@/lib/auth-client";
import type { LoginInput, RegisterInput } from "@/features/auth/schemas/auth.schema";

export function useAuth() {
  const {
    data: session,
    isPending: isLoading,
    error,
  } = authClient.useSession();

  const user = session?.user ?? null;

  const login = useCallback(async (data: LoginInput) => {
    const result = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    });

    if (result.error) {
      throw new Error(result.error.message ?? "Credenciales invalidas");
    }

    return result.data;
  }, []);

  const register = useCallback(async (data: RegisterInput) => {
    const result = await authClient.signUp.email({
      email: data.email,
      password: data.password,
      name: data.name,
    });

    if (result.error) {
      throw new Error(result.error.message ?? "Error al registrar");
    }

    return result.data;
  }, []);

  const logout = useCallback(async () => {
    await authClient.signOut();
  }, []);

  const updateProfile = useCallback(async (name: string) => {
    const result = await authClient.updateUser({ name });
    if (result.error) {
      throw new Error(result.error.message ?? "Error al actualizar el perfil");
    }
    return result.data;
  }, []);

  return {
    user,
    session,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
  };
}
