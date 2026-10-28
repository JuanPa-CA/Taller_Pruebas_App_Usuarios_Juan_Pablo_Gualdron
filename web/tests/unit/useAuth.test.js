import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAuth } from "@/composables/useAuth.js";
import { authApi } from "@/services/authApi.js";
import { tokenStorage } from "@/services/http.js";

describe("Composable useAuth (composables/useAuth.js)", () => {
  beforeEach(() => {
    localStorage.clear();
    const { logout } = useAuth();
    logout();
    vi.restoreAllMocks();
  });

  it("inicialmente no está autenticado ni es admin", () => {
    const { isAuthenticated, isAdmin, state } = useAuth();
    expect(isAuthenticated.value).toBe(false);
    expect(isAdmin.value).toBe(false);
    expect(state.user).toBeNull();
  });

  it("login establece sesión, token en storage y actualiza isAuthenticated e isAdmin", async () => {
    const mockUsuario = { uid: "1", nombre: "Admin", email: "admin@demo.com", rol: "admin" };
    vi.spyOn(authApi, "login").mockResolvedValue({
      token: "jwt-token-admin",
      usuario: mockUsuario,
    });

    const { login, isAuthenticated, isAdmin, state } = useAuth();
    await login({ email: "admin@demo.com", password: "Password123" });

    expect(isAuthenticated.value).toBe(true);
    expect(isAdmin.value).toBe(true);
    expect(state.user).toEqual(mockUsuario);
    expect(tokenStorage.get()).toBe("jwt-token-admin");
  });

  it("register establece sesión correctamente para un usuario normal", async () => {
    const mockUsuario = { uid: "2", nombre: "Usuario Normal", email: "user@demo.com", rol: "usuario" };
    vi.spyOn(authApi, "registro").mockResolvedValue({
      token: "jwt-token-usuario",
      usuario: mockUsuario,
    });

    const { register, isAuthenticated, isAdmin } = useAuth();
    await register({ nombre: "Usuario", email: "user@demo.com", password: "Password123" });

    expect(isAuthenticated.value).toBe(true);
    expect(isAdmin.value).toBe(false);
  });

  it("logout limpia el usuario y borra el token", async () => {
    const mockUsuario = { uid: "1", nombre: "Admin", email: "admin@demo.com", rol: "admin" };
    vi.spyOn(authApi, "login").mockResolvedValue({
      token: "token",
      usuario: mockUsuario,
    });

    const { login, logout, isAuthenticated } = useAuth();
    await login({ email: "admin@demo.com", password: "Password123" });
    expect(isAuthenticated.value).toBe(true);

    logout();
    expect(isAuthenticated.value).toBe(false);
    expect(tokenStorage.get()).toBeNull();
  });

  it("setUser actualiza los datos del usuario en el estado", () => {
    const { setUser, state } = useAuth();
    setUser({ uid: "123", nombre: "Nombre Actualizado", rol: "usuario" });
    expect(state.user.nombre).toBe("Nombre Actualizado");
  });
});
