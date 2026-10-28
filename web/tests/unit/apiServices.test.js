import { describe, it, expect, vi, beforeEach } from "vitest";
import * as http from "@/services/http.js";
import { authApi } from "@/services/authApi.js";
import { usersApi } from "@/services/usersApi.js";

describe("Servicios API (authApi y usersApi)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("authApi", () => {
    it("llama a los endpoints correctos con el método y payload esperados", async () => {
      const spy = vi.spyOn(http, "request").mockResolvedValue({ ok: true });

      await authApi.login({ email: "a@b.com", password: "123" });
      expect(spy).toHaveBeenCalledWith("/auth/login", {
        method: "POST",
        body: { email: "a@b.com", password: "123" },
      });

      await authApi.registro({ email: "a@b.com" });
      expect(spy).toHaveBeenCalledWith("/auth/registro", {
        method: "POST",
        body: { email: "a@b.com" },
      });

      await authApi.perfil();
      expect(spy).toHaveBeenCalledWith("/auth/perfil");

      await authApi.actualizarPerfil({ nombre: "Nuevo" });
      expect(spy).toHaveBeenCalledWith("/auth/perfil", {
        method: "PUT",
        body: { nombre: "Nuevo" },
      });

      await authApi.cambiarPassword({ passwordNueva: "123" });
      expect(spy).toHaveBeenCalledWith("/auth/password", {
        method: "PUT",
        body: { passwordNueva: "123" },
      });
    });
  });

  describe("usersApi", () => {
    it("llama a los endpoints CRUD con los parámetros adecuados", async () => {
      const spy = vi.spyOn(http, "request").mockResolvedValue({ ok: true });

      await usersApi.listar({ buscar: "ana", rol: "usuario", pagina: 1, limite: 10 });
      expect(spy).toHaveBeenCalledWith("/usuarios", {
        query: { buscar: "ana", rol: "usuario", pagina: 1, limite: 10 },
      });

      await usersApi.obtener("u123");
      expect(spy).toHaveBeenCalledWith("/usuarios/u123");

      await usersApi.crear({ nombre: "Pedro" });
      expect(spy).toHaveBeenCalledWith("/usuarios", {
        method: "POST",
        body: { nombre: "Pedro" },
      });

      await usersApi.actualizar("u123", { nombre: "Pedro Edit" });
      expect(spy).toHaveBeenCalledWith("/usuarios/u123", {
        method: "PUT",
        body: { nombre: "Pedro Edit" },
      });

      await usersApi.eliminar("u123");
      expect(spy).toHaveBeenCalledWith("/usuarios/u123", {
        method: "DELETE",
      });
    });
  });
});
