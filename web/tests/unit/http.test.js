import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  request,
  ApiError,
  tokenStorage,
  setUnauthorizedHandler,
} from "@/services/http.js";

describe("Servicio HTTP (services/http.js)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("tokenStorage", () => {
    it("guarda, obtiene y elimina el token en localStorage", () => {
      expect(tokenStorage.get()).toBeNull();
      tokenStorage.set("mi-token-jwt");
      expect(tokenStorage.get()).toBe("mi-token-jwt");
      tokenStorage.clear();
      expect(tokenStorage.get()).toBeNull();
    });
  });

  describe("request", () => {
    it("envía el header x-token si existe un token guardado en localStorage", async () => {
      tokenStorage.set("token-prueba");

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true }),
      });
      vi.stubGlobal("fetch", mockFetch);

      await request("/test");

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers["x-token"]).toBe("token-prueba");
      expect(options.headers["Accept"]).toBe("application/json");
    });

    it("serializa el body como JSON y añade Content-Type", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ recibido: true }),
      });
      vi.stubGlobal("fetch", mockFetch);

      const bodyData = { nombre: "Test", email: "test@demo.com" };
      await request("/usuarios", { method: "POST", body: bodyData });

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe("POST");
      expect(options.headers["Content-Type"]).toBe("application/json");
      expect(options.body).toBe(JSON.stringify(bodyData));
    });

    it("añade parámetros query a la URL", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [],
      });
      vi.stubGlobal("fetch", mockFetch);

      await request("/usuarios", { query: { pagina: 2, buscar: "ana" } });

      const [urlObj] = mockFetch.mock.calls[0];
      expect(urlObj.searchParams.get("pagina")).toBe("2");
      expect(urlObj.searchParams.get("buscar")).toBe("ana");
    });

    it("convierte { error } en ApiError con ese mensaje", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: "Credenciales inválidas" }),
      });
      vi.stubGlobal("fetch", mockFetch);

      await expect(request("/auth/login", { method: "POST" })).rejects.toThrow(
        "Credenciales inválidas"
      );

      try {
        await request("/auth/login", { method: "POST" });
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        expect(err.status).toBe(400);
        expect(err.message).toBe("Credenciales inválidas");
      }
    });

    it("convierte { errores: [...] } en ApiError con details por campo", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          errores: [
            { path: "email", msg: "Email no válido" },
            { path: "password", msg: "Contraseña muy corta" },
          ],
        }),
      });
      vi.stubGlobal("fetch", mockFetch);

      try {
        await request("/auth/registro", { method: "POST" });
        expect.unreachable();
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        expect(err.status).toBe(400);
        expect(err.message).toBe("Revisa los datos del formulario");
        expect(err.details).toEqual({
          email: "Email no válido",
          password: "Contraseña muy corta",
        });
      }
    });

    it("lanza ApiError con status 0 si la llamada fetch falla por red", async () => {
      vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network Error")));

      try {
        await request("/health");
        expect.unreachable();
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        expect(err.status).toBe(0);
        expect(err.message).toContain("No se pudo conectar con el servidor");
      }
    });

    it("con status 401 y token guardado ejecuta el manejador de setUnauthorizedHandler", async () => {
      tokenStorage.set("token-expirado");
      const unauthHandler = vi.fn();
      setUnauthorizedHandler(unauthHandler);

      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: "Token no válido o expirado" }),
      });
      vi.stubGlobal("fetch", mockFetch);

      try {
        await request("/auth/perfil");
      } catch (err) {
        expect(err.status).toBe(401);
      }

      expect(unauthHandler).toHaveBeenCalledTimes(1);
    });
  });
});
